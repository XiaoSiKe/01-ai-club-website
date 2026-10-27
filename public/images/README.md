# 图片资产

以下三张活动示意图片由 Codex 内置 `image_gen` 工具于 2026-10-13 生成，仅用于官网版式与氛围演示。画面人物与活动均为虚构，不代表日新社真实成员或已举办活动。正式内容发布时可替换为获授权的真实照片。页面应保留「AI 生成示意图」等明确标签，直到素材替换完成。

最终文件均为 1200 × 800 WebP；使用 Sharp 按宽度缩小并以 quality 78、effort 6 压缩，未进行内容编辑。三张图片已逐张视觉检查。

## community-salon.webp

原始生成文件：`exec-11988e36-40ea-44e6-8f60-40cfdfc5514b.png`

提示词：

> Use case: photorealistic-natural. Asset type: illustrative sample activity photo for a Chinese university AI student club website, not documentation of a real event. Create one premium monochrome editorial candid photograph of a small, intimate student presentation/discussion in a university design studio. Anonymous fictional Chinese college-age adults. Wide landscape framing approximately 3:2. A young presenter gestures casually beside a softly glowing projector screen with abstract unlabelled shapes, seated audience backs softly out of focus in foreground, a tall window on one side provides natural daylight and dimensional shadows. Capture an authentic attentive moment, understated intellectual energy, warm human connection translated into rich black and white tones, gentle film grain, modern editorial photography, subtle shallow depth of field. Avoid polished corporate staging, stock-photo smiles, handshakes, any readable text, logos, brand marks, watermark, artificial poses. All people and event fictional. Compose so center crop remains useful.

## community-workshop.webp

原始生成文件：`exec-62d71e09-b824-4ded-bbf3-4841810b1782.png`

提示词：

> Use case: photorealistic-natural. Asset type: illustrative sample activity photo for a Chinese university AI student club website, not documentation of a real event. Create one premium monochrome editorial candid photograph, wide landscape approximately 3:2: close oblique overhead view of a university student coding workshop table. Several anonymous fictional Chinese college-age adults partly visible through natural hands and shoulders, two or three unbranded laptops, notebooks with loose unlabelled diagrams, ordinary pens and one glass of water. Hands calmly typing and explaining on paper. Realistic tactile table surface, dark charcoal blacks, soft window highlights on hands and keyboards, subtle film grain, strong but refined contrast. The frame emphasizes collaboration and process, not individual faces. Screens show abstract indistinct code-like patterns, nothing readable. Avoid logos, text, watermark, neon sci-fi imagery, exaggerated gestures, clutter, unnatural fingers. All people and event fictional. Compose so center crop remains useful.

## community-together.webp

原始生成文件：`exec-1fe1b234-8ddd-4e1b-889f-459bb25b70a8.png`

提示词：

> Use case: photorealistic-natural. Asset type: illustrative sample community activity photo for a Chinese university AI student club website, not documentation of a real event. Create one premium monochrome editorial candid photograph, wide landscape approximately 3:2: four anonymous fictional Chinese college-age students working together at a simple table in a bright airy university classroom. Natural relaxed clothing, one student pointing softly to an open notebook, another listening, an unbranded closed laptop at the edge, candid quiet conversation with a slight natural smile. Window light, architectural lines and chairs softly blurred in the background, balanced negative space, rich black-and-white tonality with gentle grain, natural documentary mood, high quality contemporary editorial framing. Avoid forced stock-photo posing, corporate meeting rooms, legible text, brand logos, watermark, shiny artificial skin or exaggerated smiles. All people and event fictional. Compose so center crop remains useful.


## feishu-logo.png

飞书／Lark 标识，来源于其[官网](https://www.feishu.cn/)提供的[原始透明 PNG 图标](https://p16-hera-overseas.larksuitecdn.com/tos-mya-i-lojyj5t9n9/9b87226605154fb7b8141a9c94de22e9.png~tplv-lojyj5t9n9-origin.image)，于 2026-10-17 保存为本地资产，未修改图片。页脚通过 CSS 蒙版沿用滚动图标的黑白颜色。日新社标识复用 `public/lingyi-logo.jpg`，不修改原图。

## lingyiyang-logo.jpg

用户提供的零一扬原图，来源为 `/Users/yangzi/Documents/零一扬/重要资料/Logo/零一扬完整.jpg`，文件原样复制，未修改。滚动栏中与日新社 Logo 分别展示，通过亮度蒙版保留原图轮廓及灰阶细节；显示缩放为 160%，适配原图留白。

## join-official-wechat-qr.jpg / join-lingyiyang-wechat.jpg

用户于 2026-10-19 提供的日新社公众号二维码（430 × 430）与零一扬个人微信名片（888 × 1131），原图原样复制。加入区域通过 CSS 将两张微信图片反相显示为黑底白码；个人名片仅显示原图 (90, 258, 708, 708) 的二维码与留白，隐藏姓名、头像和底部说明。公众号二维码同时用于公众号介绍区。加入区域的三张二维码通过 CSS 统一灰阶与对比度，并使用同一 84% 亮度设置；公众号通过叠加同一原图的中心局部恢复黑底白标 Logo。浅色主题将三张二维码切换为白底深色码，公众号中心 Logo 保留原图样式。二维码内容和码点结构均沿用原图。

## business-ezcut.png / business-exdrink.png / business-smartbot.png

用户于 2026-10-19 提供的三个 1254 × 1254 PNG Logo，原图原样复制。对应关系为：图 3 → 零一快剪（business-ezcut.png），图 2 → 零一拓饮（business-exdrink.png），图 1 → 零一智械（business-smartbot.png）。用于“零一商业”模块，保留原有黑底、白色标志和立体灰阶。


## business-physicsos.png / pioneers/dong-siwei-upload.jpg

2026-10-27新增physicsOS的用户上传Logo（1024×1024透明PNG），文件原样保存；商业轮播通过WebGL着色器及CSS静态回退以灰阶展示，显示缩放为0.702。冬思韦头像使用用户新上传的1144×1144 JPEG，原图保留原色，供商业项目成员与领航先锋共用。
