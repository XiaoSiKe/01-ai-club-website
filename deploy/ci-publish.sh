#!/usr/bin/env bash
set +x
set -euo pipefail
umask 077

test -n "${CLUB_DEPLOY_SSH_KEY:-}"
test -f dist/SHA256SUMS
test -f deploy/known_hosts

ci_ssh_dir=$(mktemp -d "${TMPDIR:-/tmp}/01aiclub-flow-ssh.XXXXXXXX")
cleanup() {
  result=$?
  if [[ -d "$ci_ssh_dir" && "${ci_ssh_dir##*/}" == 01aiclub-flow-ssh.* ]]; then rm -rf -- "$ci_ssh_dir"; fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

printf '%s\n' "$CLUB_DEPLOY_SSH_KEY" > "$ci_ssh_dir/key"
unset CLUB_DEPLOY_SSH_KEY
chmod 600 "$ci_ssh_dir/key"
archive="$ci_ssh_dir/release.tgz"
COPYFILE_DISABLE=1 tar -czf "$archive" -C dist .
printf '日新社官网制品 SHA-256：'
sha256sum "$archive" | cut -d ' ' -f 1
ssh -T -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=deploy/known_hosts -o ConnectTimeout=15 \
  -o ServerAliveInterval=15 -o ServerAliveCountMax=4 \
  -i "$ci_ssh_dir/key" 01aiclub-deploy@47.106.14.254 publish < "$archive"
