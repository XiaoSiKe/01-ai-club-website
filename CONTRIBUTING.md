# 贡献指南

感谢参与零一 AI 日新社官网建设。项目仍处于早期阶段，修改应保持小而清晰，并能直接对应一个明确需求。

## 开始之前

1. 阅读 [PRODUCT.md](./PRODUCT.md)，确认内容符合社团定位和事实边界。
2. 阅读 [DESIGN.md](./DESIGN.md)，确认视觉和交互不偏离现有黑白科技风格。
3. 安装依赖并启动本地开发服务器。

```bash
npm install
npm run dev
```

## 开发约束

- 不编造课程规模、合作企业、成员数量、就业成果或项目案例。
- 不随意替换 WebGL 透视网格、回声标题或分层菜单等品牌特征。
- 新动效必须支持 `prefers-reduced-motion`。
- 交互元素必须可通过键盘访问，并具有清晰的焦点样式。
- 不提交 `node_modules/`、`dist/`、本地预览截图、日志或环境变量文件。
- 不在代码中写入令牌、密码、Cookie、私钥或其他敏感信息。

## 修改流程

1. 从 `main` 创建一个说明用途的分支。
2. 只修改完成当前需求所必需的文件。
3. 在桌面端和移动端检查布局、文字换行与横向溢出。
4. 运行生产构建。
5. 提交包含清晰说明的 commit。

```bash
npm run build
```

## 提交信息建议

使用简短、可检索的提交信息，例如：

```text
feat: add club affiliation metadata
fix: keep staggered menu animation replayable
docs: document custom domain deployment
```

## Pull Request 检查清单

- [ ] 修改内容与需求直接相关。
- [ ] `npm run build` 通过。
- [ ] 没有新增控制台错误。
- [ ] 页面没有横向溢出。
- [ ] 键盘焦点和减少动态效果模式正常。
- [ ] 文案没有引入未经确认的事实或承诺。
- [ ] 相关文档已同步更新。

