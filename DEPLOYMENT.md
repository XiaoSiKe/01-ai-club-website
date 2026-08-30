# 部署与域名说明

## 正式域名

零一 AI 日新社官网的正式域名为：

```text
club.01aiedu.com
```

站点 canonical URL：<https://club.01aiedu.com/>

## 构建产物

```bash
npm ci
npm run build
```

静态产物位于 `dist/`，部署平台的发布目录应设置为：

```text
dist
```

仓库中的 `public/CNAME` 会在构建时复制为 `dist/CNAME`。

## DNS 配置

具体记录值取决于最终托管平台。通常需要在 `01aiedu.com` 的 DNS 服务商后台新增一条 `club` 子域记录：

- 托管平台提供域名时，使用 `CNAME` 指向平台给出的目标域名。
- 托管平台提供固定 IP 时，按照平台说明使用 `A` 或 `AAAA` 记录。

不要凭经验填写目标值；必须以托管平台生成的域名验证信息为准。

## 托管平台设置

无论使用 GitHub Pages、Vercel、Cloudflare Pages 或其他静态托管平台，都应确认：

1. 安装命令为 `npm ci`。
2. 构建命令为 `npm run build`。
3. 发布目录为 `dist`。
4. 自定义域名设置为 `club.01aiedu.com`。
5. HTTPS 证书签发成功。
6. HTTP 自动跳转到 HTTPS。

## 发布后检查

- [ ] `https://club.01aiedu.com/` 返回成功状态。
- [ ] 浏览器地址栏显示有效 HTTPS 证书。
- [ ] 首页 Logo、WebGL 背景和字体正常加载。
- [ ] “社团导航”可重复打开和关闭。
- [ ] 站内按钮能够平滑滚动到目标区块。
- [ ] 桌面端和移动端均无横向溢出。
- [ ] 控制台无资源 404 和运行时错误。
- [ ] 页面源代码中的 canonical URL 为正式域名。

## 回滚

若新版本出现严重问题，优先在托管平台回滚到上一个成功构建；不要直接修改线上构建产物。修复应回到 Git 分支完成，重新构建并通过检查后再发布。

