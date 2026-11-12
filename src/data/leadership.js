import { pioneers } from './pioneers.js';

// The seven people and their posts follow the club's six-system organization plan.
// The wall distributes each row across three columns, starting with club leadership.
const roster = [
  { id: 'XiaoSiKe', name: '零一扬', role: '社长' },
  { id: 'CurvatureSoup', name: 'xyh', role: '零一技术部部长' },
  { id: 'qwq2008123-star', name: 'Keal', role: '零一商务部部长' },
  { id: 'xy821178142gxy-web', name: 'Gabi', role: '副社长' },
  { id: 'dh108888', name: 'DH', role: '零一运营部部长' },
  { id: 'miracle-fjnu', name: 'Miracle', role: '零一组织部部长' },
  { id: 'Dirgerx', name: '王云重', role: '副社长' },
];

export const leadership = roster.map(member => {
  const profile = pioneers.find(pioneer => pioneer.id === member.id);
  return {
    ...member,
    photo: profile?.photo,
    photoPlaceholder: !profile?.photo,
    photoFit: profile?.photoFit,
    focus: profile?.focus,
    href: profile?.href,
    joinedAt: profile?.joinedAt,
  };
});
