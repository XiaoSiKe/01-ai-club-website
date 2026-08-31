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

## DNS

阿里云云解析 DNS 中为 `01aiedu.com` 添加：

| 项目 | 值 |
|---|---|
| 记录类型 | `A` |
| 主机记录 | `club` |
| 解析请求来源 | 默认 |
| 记录值 | `47.106.14.254` |
| TTL | 600 秒 |

验证时必须确认权威 DNS 返回目标 IP：

```bash
dig @223.5.5.5 +short A club.01aiedu.com
```

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
- 触发条件：`main` 分支 push
- 构建集群：云效香港公共集群
- 私密变量组：`01aiclub-website-prod-secrets`
- 变量组 ID：`aiclubprodsecret`
- GitHub push webhook ID：`672788547`
- 唯一密文变量：`CLUB_DEPLOY_SSH_KEY`

CI 私钥只对应服务器上的强制命令 `receive-release.sh`，无法打开任意 shell、转发端口或修改其它站点。云效个人访问令牌不得写入流水线 YAML，也不参与生产发布。

## 发布后检查

```bash
curl -I http://club.01aiedu.com/
curl -I https://club.01aiedu.com/
curl -fsS https://club.01aiedu.com/version.json
```

- HTTP 返回 `308` 并跳转 HTTPS。
- HTTPS 返回 `200`，证书域名为 `club.01aiedu.com`。
- 首页、Logo、JavaScript 和 CSS 无 404。
- `version.json` 的提交 SHA 与发布提交一致。
- `arch.25thgame.vip` 与 `www.01yang.space` 保持原状态。

完整日常操作、日志、回滚与故障处理见 [docs/OPERATIONS.md](./docs/OPERATIONS.md)。
