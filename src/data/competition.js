// Names follow the user-provided certificates, including every listed teammate.
const certificates = [
  { title: '2026 中国电机工程学会杯全国大学生电工数学建模竞赛 · 二等奖',
    participants: ['戴振豪', '陈品铮', '陈俊祥'] },
  { title: '第十九届高教杯 · 逆向工程与创新设计分赛道一等奖',
    participants: ['韩慕昇', '杨章勋'] },
  { title: '第十九届高教杯国际赛道 · 团体一等奖',
    participants: ['韩慕昇', '杨章勋', '徐敏悦', '王毅', '陈佳宏', '齐仕选'] },
  { title: '2026 机械产品数字化设计赛区域赛 · 数字孪生一等奖',
    participants: ['韩慕昇', '游诗颖', '陈雨轩'] },
  { title: '2025 中国机器人大赛暨 RoboCup 中国赛 · 无人机自主飞行竞速三等奖',
    participants: ['徐敏悦', '蔡辰希', '韩慕昇', '刘志濠', '陈嘉磊', '关源冬'] },
  { title: '2025 中国大学生机械工程创新创意大赛 · 二等奖',
    participants: ['刘东启', '周心怡', '韩慕昇'] },
];
const photoTitles = [
  '2026 机械产品数字化设计赛全国决赛 · 备赛现场',
  '2026 机械产品数字化设计赛全国决赛 · 数字孪生赛场',
  '机械产品数字化设计赛 · 机械臂调试现场',
  '第十八届中国电机工程学会杯 · 福州大学赛场',
];
const asset = (prefix, index) => `/images/competition/${prefix}-${String(index + 1).padStart(2, '0')}`;
const certificateRatios = [595.276 / 841.89, 595.3 / 841.9, 841.9 / 595.3, 16 / 9, 595.28 / 841.89, 842 / 595];
export const competitionItems = [
  ...certificates.map((certificate, index) => ({
    ...certificate,
    id: `certificate-${index + 1}`, kind: 'certificate',
    aspectRatio: certificateRatios[index], orientation: certificateRatios[index] > 1 ? 'landscape' : 'portrait',
    image: `${asset('certificate', index)}-thumb.webp`, fullImage: `${asset('certificate', index)}.webp`,
  })),
  {
    id: 'certificate-7', kind: 'certificate',
    title: '2026 亚洲建筑规划景观数字艺术设计竞赛 · 铜奖｜四环织心——山海环生新境',
    participants: ['余齐文', '高家莹'],
    aspectRatio: 1818 / 1279, orientation: 'landscape',
    image: '/images/competition/certificate-07-thumb.webp', fullImage: '/images/competition/certificate-07.jpg',
  },
  {
    id: 'certificate-8', kind: 'certificate',
    title: '2026 亚洲建筑规划景观数字艺术设计竞赛 · 铜奖｜NEO-ARK',
    participants: ['高家莹', '卢俊达', '林晨昊', '郑宇航', '蒋旭'],
    aspectRatio: 1811 / 1279, orientation: 'landscape',
    image: '/images/competition/certificate-08-thumb.webp', fullImage: '/images/competition/certificate-08.jpg',
  },
  ...photoTitles.map((title, index) => ({
    id: `competition-${index + 1}`, title, kind: 'photo', column: 'center', aspectRatio: 3 / 2, orientation: 'landscape',
    fullAspectRatio: [1921 / 1279, 1921 / 1280, 1920 / 1279, 1707 / 1280][index],
    image: `${asset('competition', index)}-thumb.webp`, fullImage: `${asset('competition', index)}.webp`,
  })),
].map(item => ({ ...item, credit: item.participants?.join('、') }));
