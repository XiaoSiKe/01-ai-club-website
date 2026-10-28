# 阿里云 ECS 部署说明

## 正式环境

- 正式域名：`https://club.01aiedu.com/`
- ECS：华南 1（深圳），公网 IP `47.106.14.254`
- Nginx 配置：`/etc/nginx/conf.d/020-01aiclub.conf`
- 发布根目录：`/var/www/01aiclub`
- 发布用户：`01aiclub-deploy`
- 访问日志：`/var/log/nginx/01aiclub.access.log`
- 错误日志：`/var/log/nginx/01aiclub.error.log`
- TLS 配置：`/etc/letsencrypt-01aiclub`

这些资源只属于日新社官网。不得修改或复用现有的 `000-25thgame.conf`、`010-01yang-company-website.conf`、`/var/www/25thgame`、`/var/www/01yang-company-website`。

### 网络与 SSH 安全基线

- 公网入方向只允许网站端口 `80/tcp`、`443/tcp` 面向 `0.0.0.0/0`。
- `22/tcp` 不得面向 `0.0.0.0/0`；仅允许阿里云 Workbench 私网段 `100.104.0.0/16`、云效中国香港构建集群官方出口 IP，以及当前管理员的独立 `/32` 地址。
- 云效中国香港构建集群出口 IP 为 `47.57.70.87/32`、`47.242.65.197/32`、`47.90.29.115/32`、`47.57.136.136/32`。变更前应再次核对[阿里云构建集群文档](https://help.aliyun.com/zh/yunxiao/user-guide/build-a-cluster)。
- 管理员公网 IP 属于私有运维信息，只在 ECS 安全组中维护，不写入仓库。
- Ubuntu 实例不开放 `3389/tcp`；不得恢复系统初始创建的公网 RDP 规则。
- SSH 仅允许公钥认证：`PasswordAuthentication no`、`KbdInteractiveAuthentication no`、`PermitRootLogin prohibit-password`、`MaxAuthTries 3`。
- 云效发布密钥必须继续使用 `restrict,command=...` 强制命令；不得换成可交互登录密钥。

## DNS

阿里云 CDN 使用 `club.01aiedu.com` 作为加速域名，仅中国内地加速，ECS `47.106.14.254:443` 作为源站。云解析 DNS 中该域名使用：

| 项目 | 值 |
|---|---|
| 记录类型 | `CNAME` |
| 主机记录 | `club` |
| 解析请求来源 | 默认 |
| 记录值 | `club.01aiedu.com.w.kunlunaq.com` |
| TTL | 600 秒 |

验证时必须确认 CNAME 指向 CDN，最终地址由阿里云调度，不再固定为 ECS IP：

```bash
dig @223.5.5.5 +short CNAME club.01aiedu.com
```

### CDN 配置

- 业务类型：图片小文件；加速区域：中国内地。
- 回源：HTTPS、443；默认回源 Host 与 SNI 均为 `club.01aiedu.com`，源站地址必须是 ECS IP，不能改为加速域名，避免回源循环。
- CDN HTTPS 证书：`club-01aiedu-com-20261028`，与源站证书匹配；启用 HTTP/2、TLS 1.2/1.3 与 HTTP → HTTPS 跳转。
- `/assets/`：365 天缓存，权重 99；其中图片、脚本和样式的文件名包含内容哈希，浏览器沿用源站一年 immutable 策略。
- `/`：0 秒缓存，权重 1，关闭“强制内容重新验证”（等同 no-store）。此规则覆盖首页、`version.json`、ACME 验证和未匹配静态资源，发布后不会长期缓存旧 HTML。
- Gzip 与 Brotli 均开启；构建已经压缩代码，不启用会重写页面内容的额外优化或付费图片处理。
- 不将“带宽封顶”当成限速工具；当前控制台会在超过阈值时直接下线域名，10 Mbps 阈值可能打断正常集中访问。计费沿用现有按流量后付费，HTTPS 请求数按账户免费额度与实际使用计费。

切换 DNS 前必须用 CDN CNAME 模拟访问，验证证书、首屏图片和版本信息，再修改现有 `club` 记录，不保留同名 A 记录。可从 ECS 验证，避免本地代理 DNS 影响：

```bash
curl --connect-to club.01aiedu.com:443:club.01aiedu.com.w.kunlunaq.com:443 \
  -I https://club.01aiedu.com/
curl --connect-to club.01aiedu.com:443:club.01aiedu.com.w.kunlunaq.com:443 \
  https://club.01aiedu.com/version.json
```

CDN 证书与 ECS 自动续期是两份独立配置。源站证书续期后，须安全更新阿里云 CDN 证书并重新验证；当前导入证书到期时间为北京时间 **2026-11-29 23:44:14**。不要把证书私钥放入 Git、流水线正文或公开日志。

## 发布结构

```text
/var/www/01aiclub/
├── current -> releases/<版本>
├── previous -> releases/<上一版本>
├── releases/                 # 最近五个已验证版本
└── shared/
    ├── archives/             # 对应版本压缩包及校验值
    ├── incoming/             # CI 临时上传目录
    └── successful/           # 可回滚版本标记
```

发布脚本先在临时目录校验归档路径、文件类型、SHA-256 清单和必要文件，再原子切换 `current`。健康检查失败会恢复上一版本。

## 本地构建和打包

```bash
npm ci
npm run build
npm run verify:dist
```

`npm run build` 会在 `dist/` 生成 `version.json` 和 `SHA256SUMS`。已提交且工作区干净时可运行：

```bash
npm run release:package
```

压缩包写入被 Git 忽略的 `artifacts/`。

## 首次初始化

仅服务器管理员在 Workbench/root 会话中执行：

```bash
git clone --depth 1 --branch main \
  https://github.com/XiaoSiKe/01-ai-club-website.git /tmp/01aiclub-bootstrap
bash /tmp/01aiclub-bootstrap/deploy/bootstrap.sh init
```

初始化会创建专属用户、目录、强制命令 SSH 授权、Nginx HTTP 入口和发布工具。脚本在变更前后校验另外两个站点的配置哈希与发布指针。

DNS 生效且首次制品发布成功后启用 TLS：

```bash
bash /tmp/01aiclub-bootstrap/deploy/bootstrap.sh tls
```

TLS 脚本会签发 `club.01aiedu.com` 证书、切换到 HTTPS 配置并启用独立续期定时器。

## 云效 CI/CD

- 流水线名称：`01aiclub-website-prod`
- 流水线 ID：`5236605`
- 版本化配置：`deploy/aliyun-flow.yml`
- 代码源：公共 GitHub 仓库 `XiaoSiKe/01-ai-club-website`
- 触发条件：`main` 分支 push 经 GitHub Actions 检查通过后，以 HTTPS 自动触发云效并等待线上版本验收
- 构建集群：云效香港公共集群
- 私密变量组：`01aiclub-website-prod-secrets`
- 变量组 ID：`aiclubprodsecret`
- 旧 GitHub 原生 push webhook ID：`672788547`，已停用以避免重复触发
- GitHub Actions Secret：`CLUB_FLOW_WEBHOOK_URL`（HTTPS 触发地址，不进入源码或日志）
- 云效密文变量：`CLUB_DEPLOY_SSH_KEY_B64`（CI 私钥的单行 Base64）

CI 私钥只对应服务器上的强制命令 `receive-release.sh`，无法打开任意 shell、转发端口或修改其它站点。云效个人访问令牌不得写入流水线 YAML，也不参与生产发布。

`scripts/trigger-flow.mjs` 校验仓库、main 分支和本次提交后才发送请求，拒绝 HTTP 地址，并检查云效响应的 `successful` 字段；触发失败最多重试三次。GitHub 工作流随后等待 `version.json` 与本次合并提交完全一致，超时会明确失败。PR 不会获得发布入口的环境变量或触发生产发布。

## 发布后检查

```bash
curl -I http://club.01aiedu.com/
curl -I https://club.01aiedu.com/
curl -fsS https://club.01aiedu.com/version.json
```

- HTTP 返回 `301`（CDN）或 `308`（源站）并跳转 HTTPS。
- HTTPS 返回 `200`，证书域名为 `club.01aiedu.com`。
- 首页、Logo、JavaScript 和 CSS 无 404。
- `version.json` 的提交 SHA 与发布提交一致。
- `arch.25thgame.vip` 与 `www.01yang.space` 保持原状态。

完整日常操作、日志、回滚与故障处理见 [docs/OPERATIONS.md](./docs/OPERATIONS.md)。
