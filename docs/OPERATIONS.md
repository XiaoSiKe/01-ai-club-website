# 日新社官网运维手册

## 1. 管理边界

日新社官网只管理以下资源：

- 域名：`club.01aiedu.com`
- Nginx：`/etc/nginx/conf.d/020-01aiclub.conf`
- 内容：`/var/www/01aiclub`
- 工具：`/usr/local/lib/01aiclub`
- 控制：`/etc/01aiclub`
- 用户：`01aiclub-deploy`
- 日志：`/var/log/nginx/01aiclub.*.log`
- 证书：`/etc/letsencrypt-01aiclub`
- systemd：`01aiclub-certbot.service`、`01aiclub-certbot.timer`

禁止把发布脚本指向 `/var/www/25thgame`、`/var/www/01yang-company-website`，禁止编辑其它 Nginx 配置。

## 2. 日常发布

合并 PR 到 `main` 后，云效自动执行：

1. 从公共 GitHub 仓库拉取 `main`。
2. 下载并校验固定 Node.js 24.16.0。
3. `npm ci` 和生产构建。
4. 校验 `dist/SHA256SUMS` 与必要资源。
5. 使用强制命令 SSH 密钥上传归档。
6. 服务器安全解包、原子切换并做本机健康检查。

流水线失败时不会切换线上版本；切换后验收失败会自动恢复。

## 3. 本机运维配置

复制公开模板到私有目录：

```bash
install -d -m 700 ~/.local/share/01aiclub/ops
install -m 600 deploy/ops.env.example ~/.local/share/01aiclub/ops/ops.env
```

五年只读云效 PAT 存入 macOS 钥匙串，私有配置只保存 service 名称。任何令牌、Cookie、私钥正文都不得进入项目文件或 Git。

常用只读命令：

```bash
npm run ops:check
npm run ops:status
npm run ops:runs
```

## 4. 健康检查

```bash
curl -fsS https://club.01aiedu.com/ > /dev/null
curl -fsS https://club.01aiedu.com/version.json
curl -fsS https://club.01aiedu.com/lingyi-logo.jpg > /dev/null
```

服务器内部可绕过公网 DNS 验证当前 Nginx：

```bash
curl --resolve club.01aiedu.com:443:127.0.0.1 \
  https://club.01aiedu.com/version.json
```

## 5. 日志

```bash
tail -n 200 /var/log/nginx/01aiclub.access.log
tail -n 200 /var/log/nginx/01aiclub.error.log
journalctl -u 01aiclub-certbot.service --since '7 days ago'
systemctl list-timers 01aiclub-certbot.timer
```

不要在工单、聊天或公开 Issue 中粘贴完整访问日志；先删除 IP、User-Agent 中的身份信息和任何查询参数。

## 6. 手动回滚

查看可回滚版本：

```bash
find /var/www/01aiclub/shared/successful -maxdepth 1 -type f -printf '%f\n' | sort -r
```

以专属用户回滚：

```bash
sudo -u 01aiclub-deploy /usr/local/lib/01aiclub/release.sh --rollback <版本ID>
```

回滚只允许指向已经通过健康检查的版本。不要手工复制文件到 `current`，不要把 `current` 改成普通目录。

## 7. 证书续期

```bash
systemctl status 01aiclub-certbot.timer
systemctl start 01aiclub-certbot.service
certbot certificates --config-dir /etc/letsencrypt-01aiclub
```

定时器每天检查两次。续期成功后自动执行 `nginx -t` 并重载。

## 8. 密钥与令牌轮换

### CI SSH 密钥

1. 在本机生成新的 Ed25519 密钥。
2. 把新公钥加上相同的 `restrict,command=...` 前缀。
3. 通过受控初始化更新 `authorized_keys`。
4. 将新私钥编码为单行 Base64，并在云效独立变量组更新 `CLUB_DEPLOY_SSH_KEY_B64`。
5. 运行一次流水线并确认成功后撤销旧公钥。

### 云效只读 PAT

- 当前约定到期日：`2031-09-01`。
- 到期前 30 天创建新的最小权限令牌并更新 macOS 钥匙串。
- PAT 只用于本机读取流水线状态，不用于 CI 发布。
- 泄露时立即在云效个人设置删除，并清除本机钥匙串条目。

## 9. 故障处理

### 502/503/404

1. `nginx -t`。
2. 检查 `/var/www/01aiclub/current` 是否指向 `releases/` 内版本。
3. 检查错误日志。
4. 通过 `--resolve` 在服务器本机复现。
5. 必要时回滚，不直接修改构建产物。

### DNS 不生效

```bash
dig @223.5.5.5 +short A club.01aiedu.com
dig @1.1.1.1 +short A club.01aiedu.com
```

应返回 `47.106.14.254`。修改后至少等待原 TTL；不要反复新增重复 A 记录。

### 流水线无法发布

- 构建失败：先看固定 Node 下载校验、`npm ci` 与 `npm run build`。
- SSH 失败：核对 `deploy/known_hosts` 指纹、变量组中的 Base64 CI 私钥和流水线解码日志。
- 服务器拒绝：确认公钥带强制命令前缀，且用户为 `01aiclub-deploy`。
- 健康检查失败：查看流水线输出和独立 Nginx 错误日志，线上会自动回滚。

## 10. 变更检查清单

- [ ] 通过 PR 合并到 `main`。
- [ ] 本地 `npm run build` 通过。
- [ ] 云效流水线成功。
- [ ] DNS 返回目标 ECS IP。
- [ ] HTTP 跳转 HTTPS，HTTPS 200。
- [ ] `version.json` 与 Git 提交一致。
- [ ] 另外两个站点仍正常。
- [ ] 未提交任何私钥、PAT、Cookie 或真实 `.env`。
