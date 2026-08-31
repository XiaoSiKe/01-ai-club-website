#!/usr/bin/env bash
set -euo pipefail
umask 022

readonly ROOT=/var/www/01aiclub
readonly VERIFY=/usr/local/lib/01aiclub/verify-archive.py
readonly CONTROL=/etc/01aiclub
staging=''
archive_staging=''
switched=0
old_target=''

die() { printf '%s\n' "$*" >&2; exit 1; }
valid_release() { [[ "$1" =~ ^[0-9]{14}-[a-f0-9]{12}$ ]]; }
site_get() {
  if [[ -f "$CONTROL/tls-ready" ]]; then
    curl --fail --silent --show-error --max-time 15 --resolve club.01aiedu.com:443:127.0.0.1 "https://club.01aiedu.com$1"
  else
    curl --fail --silent --show-error --max-time 15 -H 'Host: club.01aiedu.com' "http://127.0.0.1$1"
  fi
}
point_to() {
  ln -s "$1" "$ROOT/.current.$$"
  mv -Tf "$ROOT/.current.$$" "$ROOT/current"
}
cleanup() {
  result=$?
  if (( result != 0 && switched == 1 )); then
    if [[ -n "$old_target" ]]; then point_to "$old_target"; elif [[ -L "$ROOT/current" ]]; then unlink "$ROOT/current"; fi
    printf '发布验收失败，已恢复上一版本。\n' >&2
  fi
  if [[ -n "$staging" && "$staging" == "$ROOT/releases/.incoming."* && -d "$staging" ]]; then rm -rf -- "$staging"; fi
  if [[ -n "$archive_staging" && "$archive_staging" == "$ROOT/shared/archives/.incoming."* ]]; then rm -f -- "$archive_staging"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

[[ $(id -un) == 01aiclub-deploy ]] || die '必须以 01aiclub-deploy 执行。'
for directory in "$ROOT" "$ROOT/releases" "$ROOT/shared" "$ROOT/shared/successful" "$ROOT/shared/archives"; do
  [[ -d "$directory" && "$(readlink -f "$directory")" == "$directory" ]] || die '日新社官网目录异常。'
done
exec 9>"$ROOT/shared/deploy.lock"
flock -w 120 9 || die '等待上一发布释放锁超时。'

if [[ -e "$ROOT/current" || -L "$ROOT/current" ]]; then
  [[ -L "$ROOT/current" ]] || die 'current 不是符号链接。'
  old_target=$(readlink -f "$ROOT/current")
  [[ "$old_target" == "$ROOT/releases/"* ]] || die '原发布指针越界。'
  valid_release "${old_target##*/}" || die '原版本名称异常。'
fi

if [[ "${1:-}" == '--rollback' ]]; then
  release=${2:-}
  valid_release "$release" || die '回滚版本格式错误。'
  [[ -f "$ROOT/shared/successful/$release" && -d "$ROOT/releases/$release" ]] || die '只能回滚到已验证版本。'
else
  [[ $# == 1 && -f "$1" ]] || die '用法：release.sh 制品.tgz 或 release.sh --rollback 版本ID'
  staging=$(mktemp -d "$ROOT/releases/.incoming.XXXXXXXX")
  release=$(python3 "$VERIFY" "$1" "$staging")
  valid_release "$release" || die '制品版本格式错误。'
  if [[ -d "$ROOT/releases/$release" ]]; then
    cmp -s "$staging/SHA256SUMS" "$ROOT/releases/$release/SHA256SUMS" || die '同一版本对应不同制品。'
  else
    chmod 755 "$staging"
    mv "$staging" "$ROOT/releases/$release"
    staging=''
  fi
fi

target="$ROOT/releases/$release"
(cd "$target" && sha256sum --quiet --check SHA256SUMS) || die '发布版本文件已改变。'
switched=1
point_to "$target"
site_get '/version.json' | cmp -s - "$target/version.json" || die '版本健康检查失败。'
site_get '/' | grep '零一 AI 日新社' > /dev/null || die '首页健康检查失败。'
site_get '/lingyi-logo.jpg' > /dev/null || die 'Logo 健康检查失败。'
for extension in js css; do
  asset=$(find "$target/assets" -type f -name "*.$extension" -print -quit)
  [[ -n "$asset" ]] || die "缺少 $extension 资源。"
  site_get "${asset#"$target"}" > /dev/null || die "$extension 资源健康检查失败。"
done

if [[ "${1:-}" != --rollback && ! -f "$ROOT/shared/archives/$release.tgz" ]]; then
  archive_staging=$(mktemp "$ROOT/shared/archives/.incoming.XXXXXXXX")
  install -m 600 "$1" "$archive_staging"
  digest=$(sha256sum "$archive_staging" | cut -d ' ' -f 1)
  printf '%s  %s\n' "$digest" "$release.tgz" > "$ROOT/shared/archives/$release.tgz.sha256"
  mv -T "$archive_staging" "$ROOT/shared/archives/$release.tgz"
  archive_staging=''
fi
if [[ -n "$old_target" && "$old_target" != "$target" ]]; then
  ln -s "$old_target" "$ROOT/.previous.$$"
  mv -Tf "$ROOT/.previous.$$" "$ROOT/previous"
fi
touch "$ROOT/shared/successful/$release"
switched=0
printf '日新社官网版本已验证并激活：%s\n' "$release"

while IFS= read -r expired; do
  valid_release "$expired" || continue
  candidate="$ROOT/releases/$expired"
  [[ "$candidate" != "$(readlink -f "$ROOT/current")" ]] || continue
  [[ ! -L "$ROOT/previous" || "$candidate" != "$(readlink -f "$ROOT/previous")" ]] || continue
  [[ -d "$candidate" && ! -L "$candidate" ]] || continue
  rm -rf -- "$candidate"
  rm -f -- "$ROOT/shared/archives/$expired.tgz" "$ROOT/shared/archives/$expired.tgz.sha256"
  rm -- "$ROOT/shared/successful/$expired"
done < <(find "$ROOT/shared/successful" -maxdepth 1 -type f -printf '%f\n' | sort -r | tail -n +6)
