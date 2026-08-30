# 零一 AI 日新社官网

零一 AI 日新社（01AIClub）是一个以公益教学为核心的 AI 兴趣社团、知识库与交流社区，面向 AI 初学者、转专业探索者和愿意参与开源实践的同学。

- 正式域名：<https://club.01aiedu.com>
- 所属标识：FZU AI CLUB · 福州大学
- 成立时间：2026 年 8 月
- 发起人：零一扬

> 以 AI 为引擎，于零一之间探索，在日新之中迭代。

## 当前状态

官网目前处于早期建设阶段。现有页面用于介绍社团理念、发展方向、成长路径和加入方式；课程、项目与社区功能会随着社团建设逐步补充。

## 技术栈

- React 19
- Vite 8
- GSAP / ScrollTrigger / ScrollToPlugin
- Three.js、OGL 与 postprocessing
- 原生 CSS

## 本地开发

要求：Node.js `^20.19.0` 或 `>=22.12.0`，并使用随 Node.js 提供的新版 npm。

```bash
npm install
npm run dev
```

Vite 会输出本地访问地址。当前开发环境通常使用 `http://localhost:5174/`，实际端口以终端输出为准。

## 构建与预览

```bash
npm run build
npm run preview
```

生产构建输出到 `dist/`。提交代码前至少运行一次 `npm run build`。

## 项目结构

```text
.
├── public/                 # 静态资源与自定义域名文件
├── src/
│   ├── App.jsx             # 页面内容、导航与滚动编排
│   ├── GridScan.jsx        # WebGL 透视扫描背景
│   ├── EchoText.jsx        # 首屏回声文字
│   ├── StaggeredMenu.jsx   # 分层展开菜单
│   ├── SpecularButton.jsx  # 描边高光按钮
│   └── styles.css          # 页面布局与响应式样式
├── PRODUCT.md              # 产品定位、用户与边界
├── DESIGN.md               # 视觉系统与交互规范
├── CONTRIBUTING.md         # 贡献流程与质量要求
└── DEPLOYMENT.md           # 域名和部署说明
```

## 设计与交互原则

- 保留黑白透视扫描空间、回声标题和透明分层菜单三个品牌特征。
- 不虚构社团规模、合作企业、课程成果或成员数据。
- 所有站内导航使用平滑滚动，并尊重系统的“减少动态效果”设置。
- 核心内容不能依赖动画才能阅读。
- 桌面端和移动端都必须避免横向溢出。

## 文档索引

- [PRODUCT.md](./PRODUCT.md)：产品定位、目标用户、品牌个性与内容边界。
- [DESIGN.md](./DESIGN.md)：颜色、字体、组件、动效和响应式设计规范。
- [CONTRIBUTING.md](./CONTRIBUTING.md)：开发流程、代码约束与提交检查。
- [DEPLOYMENT.md](./DEPLOYMENT.md)：`club.01aiedu.com` 的构建、DNS 与发布检查。

## 域名说明

项目的正式域名固定为 `club.01aiedu.com`。仓库已包含 `public/CNAME`，构建时会复制到 `dist/CNAME`。DNS 解析与托管平台绑定仍需在对应服务商后台完成，详见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 许可证

当前仓库尚未声明开源许可证。在许可证确定前，请勿将代码或品牌资源用于其他项目。
