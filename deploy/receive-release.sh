#!/usr/bin/env bash
# CI 密钥只能调用 publish 并向此入口发送静态制品。
set -euo pipefail
umask 077

readonly ROOT=/var/www/01aiclub
[[ "${SSH_ORIGINAL_COMMAND:-}" == publish ]] || { printf '此密钥仅允许日新社官网制品发布。\n' >&2; exit 1; }
[[ $(id -un) == 01aiclub-deploy ]] || exit 1
[[ $(readlink -f "$ROOT/shared/incoming") == "$ROOT/shared/incoming" ]] || exit 1

incoming=$(mktemp -d "$ROOT/shared/incoming/ci.XXXXXXXX")
cleanup() {
  result=$?
  if [[ "$incoming" == "$ROOT/shared/incoming/ci."* && -d "$incoming" ]]; then rm -rf -- "$incoming"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

head -c 134217729 > "$incoming/release.tgz"
[[ $(wc -c < "$incoming/release.tgz") -le 134217728 ]] || { printf '压缩制品超过 128 MiB。\n' >&2; exit 1; }
/usr/local/lib/01aiclub/release.sh "$incoming/release.tgz"
