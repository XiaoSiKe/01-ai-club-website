---
name: 零一 AI 日新社｜01AIClub
description: 以透视扫描空间承载开源探索、公益教学与长期共建的黑白科技视觉系统。
colors:
  canvas-black: "#090909"
  menu-transparent: "#00000000"
  surface-carbon: "#12121294"
  surface-elevated: "#15151594"
  transparent-white: "#ffffff00"
  ink-white: "#f5f5f5"
  ink-muted: "#f5f5f599"
  border-hairline: "#ffffff24"
  scan-blue: "#3b82f6"
  iteration-violet: "#7c3aed"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(3rem, 9vw, 7rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, ui-sans-serif, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(24px, 3vw, 34px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Inter, ui-sans-serif, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "14px"
  lg: "17px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "22px"
  lg: "28px"
  xl: "48px"
components:
  button-specular:
    backgroundColor: "{colors.transparent-white}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.lg}"
    padding: "18px 40px"
  card-carbon:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.md}"
    padding: "28px"
  navigation-staggered:
    backgroundColor: "{colors.menu-transparent}"
    textColor: "{colors.ink-white}"
    rounded: "0px"
    height: "100vh"
---

# Design System: 零一 AI 日新社｜01AIClub

## Overview

**Creative North Star: “零一之间的扫描实验室”**

界面像一间仍在运行的黑色实验室：透视网格给出方向，白色扫描光标记正在发生的探索，内容悬浮在空间中但始终保持清晰。视觉气质是探索、真诚、长期主义；技术感来自真实的 WebGL 空间、精确线条和响应式交互，而不是堆叠装饰。

系统必须保留“正在从零开始”的开放状态。它拒绝传统培训机构式销售页面，也拒绝用虚构规模、合作企业或成果数字制造成熟假象。布局以单一强首屏和少量分层内容为主，桌面最大内容宽度为 1184px，移动端在 900px 以下切换为单列和折叠菜单。

**Key Characteristics:**

- 黑白为主，蓝紫只用于章节标题与方向标签。
- WebGL 透视网格是品牌签名，而不是可替换的背景纹理。
- 白色文字与半透明碳黑表面保持高对比，正文长度控制在易读范围。
- 动效服务于“探索与扫描”，并完整支持减少动态效果偏好。

## Colors

主画面由深空般的碳黑与扫描白构成；蓝色代表探索方向，紫色代表持续迭代，二者只在需要指引视线时出现。

### Primary

- **扫描白**：用于主标题、关键行动和聚焦状态，是整套界面最清晰的视觉信号。

### Secondary

- **探索蓝**：用于章节流光和“公益教学”方向标记。
- **迭代紫**：用于章节流光和“成长支持”方向标记。

### Neutral

- **深空画布**：页面的永久底色，承接透视网格和所有内容。
- **碳黑表面**：导航、卡片与步骤容器的半透明层。
- **静默白**：正文、辅助说明和非主导导航使用的降权文字色。
- **发丝边界**：定义容器边缘，不让卡片变成厚重实体。

**The Sparse Accent Rule.** 蓝紫只能用于章节标题、状态徽章和必要强调；首屏主标题与按钮始终保持黑白。

## Typography

**Display Font:** 系统无衬线字体栈，以 Inter 为首选并使用中文系统字体回退。
**Body Font:** 与展示字体同源，以字重、尺寸和透明度建立层级。
**Label/Mono Font:** 日期胶囊使用系统等宽字体栈，其余标签仍使用主字体。

**Character:** 单一字体家族让中英文混排保持机械、直接和稳定；回声标题以极强字重和紧凑字距形成空间核心，正文则用宽松行距保持友好。

### Hierarchy

- **Display**（800，流体字号，0.9）：仅用于首屏回声标题；字距不得小于 -0.04em。
- **Headline**（800，流体字号，1.2）：用于章节标题和主要叙事节点。
- **Title**（700–800，17–25px，1.25–1.35）：用于卡片与步骤标题。
- **Body**（400，14–16px，1.65–1.75）：用于说明文字，段落控制在约 65–75 个字符宽度内。
- **Label**（600–800，11–15px）：用于胶囊、状态与导航，英文方向标签可使用轻微字距。

**The Echo Ceiling Rule.** 回声文字只用于首屏品牌名和一句核心口号，禁止在普通章节重复使用。

## Elevation

系统使用“环境分层”而不是传统悬浮卡片。深度主要由 WebGL 空间、半透明碳黑表面、细边界和局部背景模糊产生；阴影只用于胶囊和交互按钮的环境遮蔽。

### Shadow Vocabulary

- **按钮近场影**（`0 8px 24px rgba(0,0,0,0.25)`）：配合 WebGL 描边高光建立可点击性。
- **移动菜单影**（`0 8px 24px rgba(0,0,0,0.36)`）：只在折叠菜单展开时使用。

**The Layered Space Rule.** 先用空间、透明度和边界建立深度；只有交互层才能获得阴影。

## Components

### Buttons

- **Shape:** 轻度圆角矩形（17–18px），不做全胶囊。
- **Primary:** 透明底、扫描白文字、大号内边距；WebGL 画布绘制随鼠标方向变化的描边高光。
- **Hover / Focus:** 鼠标接近时高光增强；键盘聚焦使用 3px 扫描白外轮廓；按下缩放至 0.97。
- **Secondary:** 沿用相同结构和尺寸，通过上下文文案区分主次，不额外引入颜色。

### Chips

- **Style:** 全胶囊形状，仅用于日期、方向或简短状态；背景是低透明度白或蓝紫色，文字保持清晰。
- **State:** 不承担复杂筛选，仅作为信息标签。

### Cards / Containers

- **Corner Style:** 内容卡片为 14–16px；全屏菜单面板使用直角边界。
- **Background:** 半透明碳黑，允许背景网格隐约穿透。
- **Shadow Strategy:** 内容卡片默认无阴影，依赖边界和模糊分层。
- **Border:** 1px 发丝白边界，透明度保持克制。
- **Internal Padding:** 桌面 28px，移动端 20px。

### Navigation

`StaggeredMenu` 以透明页头悬浮在扫描空间上方，左侧社团标志为 36.8px 正方形、9px 圆角，并链接到 `#top` 以准确返回初始首页位置；右侧“社团导航”按钮与加号整体放大 15%。展开时，纯白、中灰与纯黑三层以 100ms 间隔、720ms `power3.out` 依次滑入，面板以 800ms `power3.out` 跟进；三层再用 650ms `power2.inOut` 交错淡出，让首页平滑透回。关闭使用 450ms `power3.inOut`。每次打开前必须把 panel 与所有颜色层的 opacity 重置为 1，并允许打开动作中断关闭 tween，保证连续或快速开关都能完整重播。最终菜单不使用毛玻璃或不透明底色，而是在 420px 宽度内使用六段透明渐变：左侧完全透明，向右依次为 3.5%、9%、16%、24%，最右侧仅 32% 黑色遮罩。内容左侧留白为 80px，避免菜单文字与首页标题直接叠压；文字使用局部黑色柔光，而非整块底色。菜单项按 01–05 编号错落进入，字距为 0.1em；1024px 以下切换为全屏面板。中文字号在桌面最大 40.8px、移动端 30.4px，所有标签强制保持单行。点击链接、点击外部或按 Esc 均关闭菜单。

### GridScan / EchoText

`GridScan` 是全屏固定 WebGL 透视网格，随指针产生视角响应并以白色扫描光穿越空间。首页使用更克制的低干扰参数：灵敏度 0.38、扫描透明度 0.24、3.1 秒扫描周期、0.8 秒间隔、0.32 bloom、0.0009 色差和 0.005 噪点。`EchoText` 通过 12 层滞后副本产生方向性回声。两者在减少动态效果模式下分别退化为静态网格与单层文字，核心内容始终可见。

首屏按可见边界居中，而不是只按 DOM 容器居中：日期按钮、价值说明和行动按钮组成独立的 `hero-lower`，相对标题区下移 20pt；外层内容同时上移 10pt 进行对称补偿，使首屏视觉中心与视口中心保持重合。

首屏使用一次性的分层编排：导航、方向胶囊、回声标题、口号与行动区依次从轻微位移和模糊中进入。所有站内锚点与行动按钮使用 0.8–1.35 秒、随距离自适应的 `power3.inOut` 滚动；滚动内容使用 `ScrollTrigger` 按标题、内容组和行动区分别进入，未触发时仍保持低透明可见。系统开启减少动态效果时，所有跳转改为即时定位，所有入场保持静态可见。

## Do's and Don'ts

### Do:

- **Do** 原样保留深空画布、透视扫描网格、回声标题和描边高光按钮这一组品牌签名。
- **Do** 让公益教学、AI 入门、成长指导和真实项目成为可扫描的核心信息。
- **Do** 为键盘聚焦提供清晰白色轮廓，并尊重 `prefers-reduced-motion`。
- **Do** 用真实、早期、可共建的语言表达社团状态。

### Don't:

- **Don't** 做成传统培训机构式的销售页面。
- **Don't** 虚构课程规模、合作企业、成员数量或成功案例。
- **Don't** 使用与社团无关的 API 检测业务文案。
- **Don't** 偏离用户指定的 5173 黑白科技视觉母版。
- **Don't** 把蓝紫渐变扩散到正文、按钮或大面积背景；它只负责方向提示。
- **Don't** 在普通章节复制回声标题或增加无意义的扫描动效。
