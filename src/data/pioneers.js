import { memberPortraits } from './member-portraits.js';

// Source: https://scn96l2kzmbn.feishu.cn/wiki/HLEfwV9BFiutsQkFxAQcPAB1nvb
// Display order includes the user's requested swaps; reuse supplied avatars.
const roster = [
  ['杨晗', '福州大学', 'hanyang-yh'],
  ['San', '韶关学院', 'SadSan233'],
  ['顾星宇', '福州大学', 'xy821178142gxy-web'],
  ['徐裕恒', '福州大学', 'CurvatureSoup'],
  ['KevenChen', '福州大学', 'KevinChen-KC'],
  ['DH', '福州大学', 'dh108888'],
  ['Eug', '福州理工学院', 'Eug-Y'],
  ['Sora', '福州大学', 'sora-de-su'],
  ['zsq', '西安交通大学', 'xjtuzsq-prog'],
  ['王云重', '福州大学', 'Dirgerx'],
  ['Melon', '福州大学', 'Melon-fzu'],
  ['刘韦辰', '福州大学', 'liuweichen2026'],
  ['方钰鑫', '福州大学', 'A7man55'],
  ['零一扬', '福州大学', 'XiaoSiKe'],
  ['Spark', '闽江大学', 'Sparkfengtu'],
  // Name supplied by the user after the source document was imported.
  ['郑航', '福大至诚', 'rezhoukang'],
  // No GitHub account supplied; keep a stable local ID for branch-leader links.
  ['黄铉', '福建理工大学', null, 'huang-xuan'],
  ['Miracle', '福建师范大学', null, 'miracle-fjnu'],
  ['韩慕昇', '福州大学', null, 'han-musheng'],
  ['刘枭雄', '福州大学', null, 'liu-xiaoxiong'],
  ['倪毅豪', '福建理工大学', null, 'ni-yihao'],
  ['郑弘毅', '福州大学', null, 'zheng-hongyi'],
  ['焱木阿', '福州大学', null, 'yan-mua'],
  ['黄曾熠', '福州大学', null, 'huang-zengyi'],
  ['洪悠然', '福州大学', null, 'hong-youran'],
  ['王靖伊', '福州大学', null, 'wang-jingyi'],
  ['李慧', '闽江大学', null, 'li-hui'],
  ['冬思韦', '六盘水师范学院', '122-syf-wcy'],
];

export const pioneers = roster.map(([name, university, github, memberId]) => {
  const suppliedPhoto = memberPortraits[name];
  return {
    id: memberId || github,
    name: name || github,
    university,
    href: github ? `https://github.com/${github}` : undefined,
    photo: suppliedPhoto || '',
    photoPlaceholder: !suppliedPhoto,
    photoFit: 'contain',
    focus: '50% 50%',
  };
});
