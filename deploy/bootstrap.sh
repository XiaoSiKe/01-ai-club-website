#!/usr/bin/env bash
# 仅初始化日新社官网专属资源；日常流水线不得以 root 执行本脚本。
set -euo pipefail
umask 022

readonly ROOT=/var/www/01aiclub
readonly CONTROL=/etc/01aiclub
readonly CONFIG=/etc/nginx/conf.d/020-01aiclub.conf
readonly LIB=/usr/local/lib/01aiclub
readonly SOURCE=$(cd "$(dirname "$0")" && pwd)
mode=${1:-init}

[[ $(id -u) == 0 ]] || { printf '初始化需要 root 权限。\n' >&2; exit 1; }
[[ "$mode" == init || "$mode" == tls ]] || { printf '仅支持 init 或 tls。\n' >&2; exit 1; }

assert_plain_path() {
  local current='' part
  local -a parts
  IFS=/ read -r -a parts <<< "$1"
  for part in "${parts[@]}"; do
    [[ -n "$part" ]] || continue
    current="$current/$part"
    [[ ! -L "$current" ]] || { printf '受管路径存在符号链接：%s\n' "$current" >&2; exit 1; }
  done
}
for path in "$ROOT" "$ROOT/releases" "$ROOT/shared" "$ROOT/shared/successful" "$ROOT/shared/incoming" "$ROOT/shared/archives" \
  "$CONTROL" "$CONTROL/nginx-tls.conf" "$CONTROL/tls-ready" "$CONFIG" "$LIB" "$LIB/release.sh" \
  "$LIB/verify-archive.py" "$LIB/receive-release.sh" /var/backups/01aiclub /var/lib/01aiclub/acme \
  /var/lib/01aiclub/deploy-home /etc/letsencrypt-01aiclub /var/lib/letsencrypt-01aiclub \
  /var/log/letsencrypt-01aiclub /etc/systemd/system/01aiclub-certbot.service \
  /etc/systemd/system/01aiclub-certbot.timer; do
  assert_plain_path "$path"
done

if id 01aiclub-deploy > /dev/null 2>&1; then
  [[ $(getent passwd 01aiclub-deploy | cut -d: -f6) == /var/lib/01aiclub/deploy-home ]] || {
    printf '已有同名用户的家目录不符合约定。\n' >&2; exit 1;
  }
fi

nginx -t
protected_files=(/etc/nginx/conf.d/000-25thgame.conf /etc/nginx/conf.d/010-01yang-company-website.conf /etc/nginx/sites-enabled/beian)
protected_before=$(sha256sum "${protected_files[@]}")
game_target=$(readlink -f /var/www/25thgame/current)
company_target=$(readlink -f /var/www/01yang-company-website/current)

install -d -m 700 /var/backups/01aiclub
backup=$(mktemp -d /var/backups/01aiclub/change.XXXXXXXX)
had_config=0
config_changed=0
if [[ -f "$CONFIG" ]]; then
  grep -q 'server_name club.01aiedu.com' "$CONFIG" || { printf '目标配置并非日新社官网。\n' >&2; exit 1; }
  cp -a "$CONFIG" "$backup/nginx.conf"
  had_config=1
fi
cleanup() {
  result=$?
  if (( result != 0 && config_changed == 1 )); then
    if (( had_config == 1 )); then cp -a "$backup/nginx.conf" "$CONFIG"; else rm -f -- "$CONFIG"; fi
    if nginx -t; then systemctl reload nginx; fi
    printf '初始化失败，已恢复入口配置；备份：%s\n' "$backup" >&2
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap 'exit 130' INT

install -d -m 755 "$CONTROL" "$LIB" /var/lib/01aiclub /var/lib/01aiclub/acme
if ! id 01aiclub-deploy > /dev/null 2>&1; then
  useradd --system --user-group --create-home --home-dir /var/lib/01aiclub/deploy-home --shell /bin/bash 01aiclub-deploy
fi
for directory in "$ROOT" "$ROOT/releases" "$ROOT/shared"; do
  install -d -m 755 -o 01aiclub-deploy -g 01aiclub-deploy "$directory"
done
for directory in "$ROOT/shared/successful" "$ROOT/shared/incoming" "$ROOT/shared/archives"; do
  install -d -m 700 -o 01aiclub-deploy -g 01aiclub-deploy "$directory"
done
install -m 755 "$SOURCE/release.sh" "$LIB/release.sh"
install -m 755 "$SOURCE/verify-archive.py" "$LIB/verify-archive.py"
install -m 755 "$SOURCE/receive-release.sh" "$LIB/receive-release.sh"
install -m 644 "$SOURCE/nginx.conf" "$CONTROL/nginx-tls.conf"

key_dir=/var/lib/01aiclub/deploy-home/.ssh
[[ $(wc -l < "$SOURCE/ci-deploy-key.pub") -eq 1 ]] || { printf 'CI 公钥文件必须只有一行。\n' >&2; exit 1; }
grep -q '^restrict,command="/usr/local/lib/01aiclub/receive-release.sh" ssh-ed25519 ' "$SOURCE/ci-deploy-key.pub"
ssh-keygen -lf "$SOURCE/ci-deploy-key.pub" > /dev/null
install -d -m 700 -o 01aiclub-deploy -g 01aiclub-deploy "$key_dir"
if [[ -f "$key_dir/authorized_keys" ]]; then
  grep -Fxq -f "$SOURCE/ci-deploy-key.pub" "$key_dir/authorized_keys" || {
    printf '日新社部署用户已有不同授权，停止覆盖。\n' >&2; exit 1;
  }
else
  install -m 600 -o 01aiclub-deploy -g 01aiclub-deploy "$SOURCE/ci-deploy-key.pub" "$key_dir/authorized_keys"
fi

if [[ "$mode" == init ]]; then
  if [[ -f "$CONTROL/tls-ready" ]]; then
    printf 'TLS 已启用，仅更新部署工具。\n'
  else
    config_changed=1
    install -m 644 "$SOURCE/nginx-http.conf" "$CONFIG"
  fi
else
  command -v certbot > /dev/null
  certbot certonly --non-interactive --agree-tos --email 1241798750@qq.com \
    --webroot -w /var/lib/01aiclub/acme --cert-name 01aiclub -d club.01aiedu.com \
    --config-dir /etc/letsencrypt-01aiclub --work-dir /var/lib/letsencrypt-01aiclub \
    --logs-dir /var/log/letsencrypt-01aiclub --keep-until-expiring
  config_changed=1
  install -m 644 "$CONTROL/nginx-tls.conf" "$CONFIG"
fi

nginx -t
systemctl reload nginx
test "$(sha256sum "${protected_files[@]}")" = "$protected_before"
test "$(readlink -f /var/www/25thgame/current)" = "$game_target"
test "$(readlink -f /var/www/01yang-company-website/current)" = "$company_target"
if [[ "$mode" == tls ]]; then
  install -m 644 "$SOURCE/01aiclub-certbot.service" /etc/systemd/system/01aiclub-certbot.service
  install -m 644 "$SOURCE/01aiclub-certbot.timer" /etc/systemd/system/01aiclub-certbot.timer
  systemctl daemon-reload
  systemctl enable --now 01aiclub-certbot.timer
  touch "$CONTROL/tls-ready"
fi
printf '日新社官网独立入口初始化完成；其它站点配置与发布指针未改变。备份：%s\n' "$backup"
