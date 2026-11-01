# Partner display assets

Names and assets were supplied by the club. Asset retrieval began 2026-10-21.
Verified official destinations were added on 2026-11-01 and open in a new tab
with `noopener noreferrer`. Unconfirmed destinations remain display-only.

## Official destinations

| Partner | Official destination |
| --- | --- |
| 中国移动 | https://www.10086.cn/ |
| MoneyAI | https://moneyai.top/ |
| 百度搭子 | https://www.dumate.cn/ |
| Trae | https://www.trae.cn/ |
| 华为 | https://www.huawei.com/cn/ |
| 得物 | https://www.dewu.com/ |
| workbuddy | https://www.workbuddy.cn/ |
| Adventure X | https://www.adventure-x.cn/zh/ |
| NextStep | https://portal.nextstep.org.cn/ |

MoneyAI's own Fuzhou hackathon at https://join.moneyai.top/ identifies
MoneyAI-Agents and links back to `moneyai.top`. NextStep's official portal is
titled `NEXTSTEP 2026 黑客松`. Both were checked to distinguish similarly named
products. At the user's request, Linkathon, XCombinator and 闽客松 remain
display-only because no official destinations were supplied.

## Logo assets

- **中国移动 — `chinamobile.svg`:** original header SVG from the official corporate
  website. Page: https://www.chinamobileltd.com/en/media/corpimage.php
  Asset: https://www.chinamobileltd.com/en/images/global/logo.svg
- **MoneyAI — `moneyai.png`:** user-provided visual reference, prepared as a
  transparent asset by the image-generation task. The marquee displays the
  planet/ring in grayscale and adds the supplied MoneyAI name as live text.
- **百度搭子 — `dumate.svg`:** official DuMate wordmark linked by its product page,
  https://www.dumate.cn/ . Asset:
  https://now.bdstatic.com/store/v2/d33e0f5/dumate-portal/7724021/static/svg/dumate-wordmark.96cd8019.svg
- **Trae — `trae.png`:** favicon referenced by https://www.trae.cn/ . Asset:
  https://lf-cdn.trae.com.cn/obj/trae-com-cn/trae_website_prod_cn/favicon.png
  The accompanying display name uses the user-supplied casing, Trae.
- **华为 — `huawei.png`:** original logo referenced by https://www.huawei.com/en .
  Asset: https://www.huawei.com/-/media/hcomponent-header/1.0.1.20260908162100/component/img/huawei_logo.png
- **Linkathon — `linkathon-original.jpg`:** the user's original JPEG is preserved
  byte-for-byte. An SVG luminance mask removes the original near-black backdrop
  and outer padding, then renders the original emblem and full wordmark in the
  current theme's ink. The mask removes background values below 6% to avoid a
  rectangular haze; no generated replacement or solid backing is used.
- **得物 — `dewu.ico`:** the 64px icon referenced by the official homepage
  https://www.dewu.com/ at https://www.dewu.com/static/favicon.ico, displayed
  alongside the supplied Chinese brand name.
- **workbuddy — `workbuddy.svg`:** original icon referenced by the official site,
  https://www.workbuddy.cn/ . Asset:
  https://assets.workbuddy.cn/web/workbuddy/7e170c91f6fb3aa5720dd4381254492d08bf980c/assets/logo.svg
  The accompanying display name uses the user-supplied lowercase spelling.

- **闽客松 — `minkesong.png`:** user-supplied logo, added 2026-10-30.
  Prepared with the built-in image editor as a solid black, transparent PNG;
  trimmed to the artwork and resized to 600px wide for local website use.
  Edit prompt: remove the white background and outer border, turn blue/cyan
  artwork black, preserve the emblem, Chinese lettering and original proportions,
  and retain antialiased edges without shadows or gradients.
  Displayed at 118 × 49.56px, offset upward 5px before the shared scale,
  with theme-aware monochrome CSS.

- **Adventure X — `adventure-x.png`:** user-supplied transparent white logo,
  added 2026-11-01. Original 1646 × 256px PNG preserved byte-for-byte.
  Displayed at 210 × 32.66px before the shared scale, preserving its wide
  proportions; existing monochrome CSS adapts it to dark and light themes.

- **XCombinator — `xcombinator.png`:** user-supplied `XC 透明.png`, added
  2026-11-01. Original 2172 × 724px transparent PNG preserved byte-for-byte.
  Displayed at 192 × 64px before the shared scale. Grayscale is inverted only
  on dark backgrounds, retaining contrast between the square emblem and its X.
- **NextStep — `nextstep.svg`:** user-supplied black vector wordmark from
  `NextStep/svg/Black·nextstep 1 [Vectorized].svg`, added 2026-11-01 and preserved
  byte-for-byte. Displayed at 210 × 24.48px before the shared scale, using the
  existing theme-aware monochrome CSS.

Official assets are stored locally without changing their source files. CSS
adapts monochrome wordmarks to the page theme and displays all product icons in
grayscale, including on hover. If an image cannot be loaded, its actual
partner name is displayed as plain text instead of a broken image or demo logo.
