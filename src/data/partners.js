// Names and assets were supplied by the club. Verified official destinations
// and asset provenance are recorded in public/images/partners/SOURCES.md.
// Entries without a confirmed destination remain display-only.
// Optical sizes balance wordmarks, icon/name pairs, and the original vertical lockup.
export const partners = [
  { id: 'china-mobile', category: 'community', href: 'https://www.10086.cn/', name: '中国移动', src: '/images/partners/chinamobile.svg', darkSrc: '/images/partners/chinamobile-dark.svg', width: 144, height: 34 },
  { id: 'moneyai', category: 'community', href: 'https://moneyai.top/', name: 'MoneyAI', src: '/images/partners/moneyai.png', width: 44, height: 44, showName: true },
  { id: 'baidu-dumate', category: 'community', href: 'https://www.dumate.cn/', name: '百度搭子', src: '/images/partners/dumate.svg', darkSrc: '/images/partners/dumate-dark.svg', width: 112, height: 23.5 },
  { id: 'xcombinator', category: 'community', name: 'XCombinator', src: '/images/partners/xcombinator.png', artwork: { width: 2172, height: 724, darkInk: { x: 580 } }, width: 192, height: 64 },
  { id: 'trae', category: 'community', href: 'https://www.trae.cn/', name: 'Trae', src: '/images/partners/trae.png', artwork: { viewBox: '7 11 34 26', width: 48, height: 48, cutout: true, backdropThreshold: .4 }, width: 42, height: 32.12, showName: true },
  { id: 'huawei', category: 'community', href: 'https://www.huawei.com/cn/', name: '华为', src: '/images/partners/huawei.png', artwork: { width: 266, height: 60, darkInk: { x: 80 } }, width: 132, height: 30 },
  { id: 'linkathon', category: 'hackathon', name: 'Linkathon', src: '/images/partners/linkathon-original.jpg', width: 96, height: 60.9, artwork: { viewBox: '150 205 1135 720', width: 1400, height: 1280, cutout: true, adaptNeutral: true } },
  { id: 'dewu', category: 'community', href: 'https://www.dewu.com/', name: '得物', src: '/images/partners/dewu.png', artwork: { viewBox: '12 32 96 56', width: 120, height: 120, cutout: true, backdropThreshold: .6, adaptNeutral: true }, width: 64, height: 37.33 },
  { id: 'workbuddy', category: 'community', href: 'https://www.workbuddy.cn/', name: 'workbuddy', src: '/images/partners/workbuddy.svg', width: 32, height: 32, showName: true },
  { id: 'minkesong', category: 'hackathon', name: '闽客松', src: '/images/partners/minkesong-bright.png', width: 128, height: 55.52, offsetY: -5 },
  { id: 'shenkesong', category: 'hackathon', name: '深客松', src: '/images/partners/shenkesong.png', darkBrightness: 1.15, width: 129.6, height: 46.386 },
  { id: 'hackflows', category: 'hackathon', name: 'HackFlows', src: '/images/partners/hackflows.png', darkSrc: '/images/partners/hackflows-dark.png', crop: { viewBox: '52 52 1064 118', width: 1168, height: 222 }, width: 192, height: 21.29 },
  { id: 'fluxtech-nankesong', category: 'hackathon', name: 'FluxTech 南客松', src: '/images/partners/fluxtech-nankesong.png', darkSrc: '/images/partners/fluxtech-nankesong-dark.png', width: 210, height: 54.94 },
  { id: 'zhongyuan', category: 'hackathon', name: '中源黑客松', src: '/images/partners/zhongyuan.svg', artwork: { viewBox: '39 231 1732 575', width: 1845, height: 1080, cutout: true, adaptNeutral: true }, width: 182.4, height: 60.553 },
  { id: 'adventure-x', category: 'hackathon', href: 'https://www.adventure-x.cn/zh/', name: 'Adventure X', src: '/images/partners/adventure-x.png', invertOnLight: true, width: 210, height: 32.66 },
  { id: 'nextstep', category: 'hackathon', href: 'https://portal.nextstep.org.cn/', name: 'NextStep', src: '/images/partners/nextstep.svg', darkSrc: '/images/partners/nextstep-white.svg', width: 210, height: 24.48 },
  { id: 'emerge', category: 'hackathon', name: 'Emerge', src: '/images/partners/emerge.svg', darkSrc: '/images/partners/emerge-white.svg', width: 144, height: 36.24 },
  { id: 'bayhack', category: 'hackathon', href: 'https://bayhack.cn/', name: '大湾区黑客松 BayHack', src: '/images/partners/bayhack.png', darkSrc: '/images/partners/bayhack-dark.png', width: 210, height: 40.27 },
  { id: 'codeland', category: 'community', href: 'https://gocodeland.cn/', name: '上岛计划 CodeLand', src: '/images/partners/codeland.svg', darkSrc: '/images/partners/codeland-dark.svg', width: 173.28, height: 28.040675 },
  { id: 'atomhub', category: 'community', name: '原子公社 AtomHub', src: '/images/partners/atomhub.svg', invertOnDark: true, width: 157.5, height: 57.51 },
  { id: 'r7-community', category: 'community', name: 'R7社区', src: '/images/partners/r7-community.png', width: 64.638, height: 57.6 },
  { id: 'oral-english-association', category: 'university', name: '英语口语协会', src: '/images/partners/oral-english-association.png', darkSrc: '/images/partners/oral-english-association-dark.svg', width: 133.11, height: 48.492 },
];

export const partnerCategories = [
  { id: 'community', title: '社区合作伙伴' },
  { id: 'university', title: '高校合作伙伴' },
  { id: 'hackathon', title: '黑客松合作伙伴' },
];
