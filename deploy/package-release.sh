#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -n "$(git status --porcelain)" ]]; then
  printf '发布打包要求干净工作区，请先提交已验证改动。\n' >&2
  exit 1
fi

npm ci --no-audit --no-fund
npm run build
commit=$(git rev-parse HEAD)
test "$(node -p "JSON.parse(require('fs').readFileSync('dist/version.json')).commit")" = "$commit"
mkdir -p artifacts
archive="artifacts/01aiclub-${commit}.tgz"
COPYFILE_DISABLE=1 tar -czf "$archive" -C dist .
shasum -a 256 "$archive" > "$archive.sha256"
printf '已生成 %s 及 SHA-256 校验文件。\n' "$archive"
