import { memberPortraits } from './member-portraits.js';
import { branches } from './branches.js';

// Source: https://scn96l2kzmbn.feishu.cn/wiki/HLEfwV9BFiutsQkFxAQcPAB1nvb
// Display order includes the user's requested swaps; reuse supplied avatars.
const roster = [
  ['杨晗', '福州大学', 'hanyang-yh', null, '2026-10-11'],
  ['San', '韶关学院', 'SadSan233', null, '2026-10-12'],
  ['顾星宇', '福州大学', 'xy821178142gxy-web', null, '2026-09-18'],
  ['徐裕恒', '福州大学', 'CurvatureSoup', null, '2026-09-18'],
  ['KevenChen', '福州大学', 'KevinChen-KC', null, '2026-10-11'],
  ['DH', '福州大学', 'dh108888', null, '2026-09-18'],
  ['Eug', '福州理工学院', 'Eug-Y', null, '2026-09-01'],
  ['Sora', '福州大学', 'sora-de-su', null, '2026-10-11'],
  ['zsq', '西安交通大学', 'xjtuzsq-prog', null, '2026-10-19'],
  ['王云重', '福州大学', 'Dirgerx', null, '2026-10-05'],
  ['Melon', '福州大学', 'Melon-fzu', null, '2026-09-18'],
  ['刘韦辰', '福州大学', 'liuweichen2026', null, '2026-10-12'],
  ['方钰鑫', '福州大学', 'A7man55', null, '2026-10-11'],
  ['零一扬', '福州大学', 'XiaoSiKe', null, '2026-09-01'],
  ['Spark', '闽江大学', 'Sparkfengtu', null, '2026-10-21'],
  // Name supplied by the user after the source document was imported.
  ['郑航', '福大至诚', 'rezhoukang', null, '2026-10-25'],
  // No GitHub account supplied; keep a stable local ID for branch-leader links.
  ['黄铉', '福建理工大学', null, 'huang-xuan', '2026-10-21'],
  ['Miracle', '福建师范大学', null, 'miracle-fjnu', '2026-10-25'],
  ['韩慕昇', '福州大学', null, 'han-musheng', '2026-09-01'],
  ['刘枭雄', '福州大学', null, 'liu-xiaoxiong', '2026-09-18'],
  ['倪毅豪', '福建理工大学', null, 'ni-yihao', '2026-10-17'],
  ['郑弘毅', '福州大学', null, 'zheng-hongyi', '2026-09-18'],
  ['焱木阿', '福州大学', null, 'yan-mua', '2026-10-11'],
  ['黄曾熠', '福州大学', null, 'huang-zengyi', '2026-10-12'],
  ['洪悠然', '福州大学', null, 'hong-youran', '2026-10-27'],
  ['王靖伊', '福州大学', null, 'wang-jingyi', '2026-10-27'],
  ['李慧', '闽江大学', null, 'li-hui', '2026-10-25'],
  ['冬思韦', '六盘水师范学院', '122-syf-wcy', null, '2026-10-27'],
  ['吴浩然', '吉林建筑大学', 'Joshmax010', null, '2026-10-29'],
  ['张荣晖', '福州大学', 'likezz-rh', null, '2026-10-29'],
  ['郑鑫尧', '泉州海洋学院', 'qwq2008123-star', null, '2026-10-30'],
  ['吴耀辉', '福建农林大学', '1302707875wu', 'wu-yaohui', '2026-10-30'],
];

// Fifth column: joining date in YYYY-MM-DD format, supplied and corrected
// by the user on 2026-10-30. This explicit roster supersedes Git-derived dates.
export const pioneers = roster.map(([name, university, github, memberId, joinedAt]) => {
  const suppliedPhoto = memberPortraits[name];
  const foundedBranch = branches.find(branch => branch.leader?.name === name);
  return {
    id: memberId || github,
    name: name || github,
    university,
    joinedAt: joinedAt || null,
    founding: foundedBranch ? {
      date: foundedBranch.founded,
      name: foundedBranch.name,
      href: `./?branch=${encodeURIComponent(foundedBranch.id)}#cooperation`,
    } : null,
    href: github ? `https://github.com/${github}` : undefined,
    photo: suppliedPhoto || '',
    photoPlaceholder: !suppliedPhoto,
    photoFit: 'contain',
    focus: '50% 50%',
  };
});

export function searchPioneers(query) {
  const name = query.trim().normalize('NFKC').toLocaleLowerCase();
  return name ? pioneers.filter(member => member.name.normalize('NFKC').toLocaleLowerCase().includes(name)) : [];
}
