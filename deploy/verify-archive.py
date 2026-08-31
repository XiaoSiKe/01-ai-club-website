#!/usr/bin/env python3
"""在空目录中安全解包并验证日新社静态制品。"""
import datetime
import hashlib
import json
import pathlib
import re
import sys
import tarfile


def verify(archive, destination):
    destination = pathlib.Path(destination)
    if not destination.is_dir() or any(destination.iterdir()):
        raise ValueError("解包目录必须是已存在的空目录")
    entries = set()
    total = 0
    with tarfile.open(archive, "r|gz") as bundle:
        for count, member in enumerate(bundle, start=1):
            if count > 10000:
                raise ValueError("制品文件数量异常")
            path = pathlib.PurePosixPath(member.name)
            if path == pathlib.PurePosixPath(".") and member.isdir():
                continue
            if path.is_absolute() or any(part in ("..", "") or part.startswith(".") for part in path.parts):
                raise ValueError("制品路径越界或包含隐藏文件")
            if not (member.isfile() or member.isdir()):
                raise ValueError("制品不允许链接、设备或其他特殊文件")
            name = path.as_posix()
            if re.search(r"(^|/)(node_modules|package(-lock)?\.json|ops\.env[^/]*)(/|$)|\.(pem|key|p12|pfx|py|sh)$", name):
                raise ValueError("制品包含非静态或敏感文件")
            if name in entries:
                raise ValueError("制品包含重复路径")
            entries.add(name)
            total += member.size
            if total > 512 * 1024 * 1024:
                raise ValueError("静态制品解包体积异常")
            target = destination.joinpath(*path.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with bundle.extractfile(member) as source, target.open("xb") as output:
                    while chunk := source.read(1024 * 1024):
                        output.write(chunk)
                target.chmod(0o644)

    sums = (destination / "SHA256SUMS").read_text().splitlines()
    listed = set()
    for line in sums:
        match = re.fullmatch(r"([a-f0-9]{64})  ([^\r\n]+)", line)
        if not match:
            raise ValueError("制品校验清单格式错误")
        digest, name = match.groups()
        path = pathlib.PurePosixPath(name)
        if path.is_absolute() or ".." in path.parts or name in listed:
            raise ValueError("校验清单路径非法或重复")
        listed.add(name)
        target = destination.joinpath(*path.parts)
        if not target.is_file():
            raise ValueError("制品文件缺失")
        hasher = hashlib.sha256()
        with target.open("rb") as content:
            while chunk := content.read(1024 * 1024):
                hasher.update(chunk)
        if hasher.hexdigest() != digest:
            raise ValueError("制品文件 SHA-256 校验失败")
    actual = {p.relative_to(destination).as_posix() for p in destination.rglob("*") if p.is_file()}
    if listed != actual - {"SHA256SUMS"}:
        raise ValueError("制品包含未校验文件或缺少文件")
    required = {"index.html", "CNAME", "lingyi-logo.jpg", "version.json"}
    if not required.issubset(actual):
        raise ValueError("静态站点必要文件缺失")
    if not any(re.fullmatch(r"assets/.+\.js", name) for name in actual):
        raise ValueError("缺少 JavaScript 资源")
    if not any(re.fullmatch(r"assets/.+\.css", name) for name in actual):
        raise ValueError("缺少 CSS 资源")
    if (destination / "CNAME").read_text().strip() != "club.01aiedu.com":
        raise ValueError("CNAME 与正式域名不一致")
    version = json.loads((destination / "version.json").read_text())
    if not re.fullmatch(r"[a-f0-9]{40}", version.get("commit", "")):
        raise ValueError("制品提交 SHA 无效")
    built_at = datetime.datetime.fromisoformat(version["builtAt"].replace("Z", "+00:00"))
    if built_at.tzinfo is None:
        raise ValueError("构建时间必须带时区")
    release = built_at.astimezone(datetime.timezone.utc).strftime("%Y%m%d%H%M%S") + "-" + version["commit"][:12]
    print(release)


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("用法：verify-archive.py 制品.tgz 空目录")
        verify(sys.argv[1], sys.argv[2])
    except (OSError, ValueError, KeyError, tarfile.TarError) as error:
        print(f"制品验证失败：{error}", file=sys.stderr)
        sys.exit(1)
