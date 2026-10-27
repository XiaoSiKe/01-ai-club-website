import { memberPortraits } from './member-portraits.js';

// Branch names, statuses and leaders supplied by the user.
// Coordinates refer to the universities' public campuses, not an event venue.
export const branches = [
  {
    id: 'fzu', school: '福州大学', shortName: '福大', name: '零一 AI 日新社', role: '总社',
    founded: '2026-09-01',
    leader: { name: '零一扬', title: '社长', avatar: memberPortraits['零一扬'] },
    coordinates: [119.1933416, 26.0614068], osmId: 12658065, campus: '旗山校区',
    address: '福建省福州市大学新区学园路2号',
    description: '从零到一，让技术进步成为每个人的机会。和福大的同伴一起，把好奇心带进真实的学习与实践。',
    crest: '/images/branches/fzu-crest.png', searchTerms: '福州大学 福大 fzu 总社 零一 AI 日新社 零一AI日新社 福建 福州 旗山',
    website: 'https://www.fzu.edu.cn/',
    addressSource: 'https://zsb.fzu.edu.cn/xxgk/xyfg/qsxy.htm',
    labelSide: 'right',
  },
  {
    id: 'fjnu', school: '福建师范大学', shortName: '福师大', name: '福师大分社', role: '分社',
    founded: '2026-10-25',
    leader: { name: 'Miracle', title: '分社长', avatar: memberPortraits.Miracle },
    coordinates: [119.2045602, 26.0327333], osmId: 12658062, campus: '旗山校区',
    address: '福建省福州市闽侯县上街镇乌龙江中大道18号',
    description: '和福师大的同伴一起，在学习、交流与实践中探索 AI。',
    crest: '/images/branches/fjnu-crest.svg', searchTerms: '福建师范大学 福师大 师大 fjnu 分社 福建 福州 旗山',
    website: 'https://www.fjnu.edu.cn/',
    addressSource: 'https://office.fjnu.edu.cn/810/list.htm',
    labelSide: 'right',
  },
  {
    id: 'fjut', school: '福建理工大学', shortName: '福理工', name: '福理工分社', role: '分社',
    founded: '2026-10-21',
    leader: { name: '黄铉', title: '分社长', avatar: memberPortraits['黄铉'] },
    coordinates: [119.1910378, 26.0383264], osmId: 12658060, campus: '旗山校区',
    address: '福建省福州市闽侯县上街镇学府南路69号',
    description: '在交流中分享新发现，在共创中尝试新可能。和福理工的同伴一起，让学习走向实践。',
    crest: '/images/branches/fjut-crest.svg', searchTerms: '福建理工大学 福建工程学院 福理工 福工 fjut 分社 福建 福州 旗山',
    website: 'https://www.fjut.edu.cn/',
    addressSource: 'https://join.fjut.edu.cn/lxwm/list.htm',
    labelSide: 'right',
  },
  {
    id: 'fuzc', school: '福州大学至诚学院', shortName: '福大至诚', name: '福大至诚分社', role: '分社',
    founded: '2026-10-26',
    leader: { name: '郑航', title: '分社长', avatar: memberPortraits['郑航'] },
    coordinates: [119.2680121, 26.0786045], osmId: 717445438, campus: '杨桥西路50号',
    address: '福建省福州市鼓楼区杨桥西路50号',
    description: '和福大至诚的同伴一起，在学习、交流与实践中探索 AI。',
    crest: '/images/branches/fuzc-crest.png', searchTerms: '福州大学至诚学院 福大至诚 至诚 fuzc 分社 福建 福州 鼓楼 杨桥西路',
    website: 'https://www.fdzcxy.edu.cn/',
    addressSource: 'https://www.fdzcxy.edu.cn/xyzc/list.htm',
    labelSide: 'right',
  },
  {
    id: 'fit', school: '福州理工学院', shortName: '福州理工', name: '福州理工分社', role: '分社',
    founded: '2026-10-26',
    leader: { name: 'Eug', title: '分社长', avatar: memberPortraits.Eug },
    coordinates: [119.4655281, 26.2428289], osmId: 582302622, campus: '连江校区',
    address: '福建省福州市连江西江滨大道8号',
    description: '和福州理工的同伴一起，在学习、交流与实践中探索 AI。',
    crest: '/images/branches/fit-crest.png', crestBackground: '#fff', searchTerms: '福州理工学院 福州理工 FIT Fuzhou Institute of Technology 分社 福建 福州 连江',
    website: 'https://www.fit.edu.cn/',
    addressSource: 'https://www.fit.edu.cn/html/1675325920.html',
    labelSide: 'left',
  },
];

export const branchById = Object.fromEntries(branches.map(branch => [branch.id, branch]));
export const FUZHOU_CENTER = [119.200519, 26.047886];

export function searchBranches(query) {
  const terms = query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return branches.filter(branch => terms.every(term => `${branch.school} ${branch.name} ${branch.searchTerms} ${branch.leader?.title || ''} ${branch.leader?.name || ''}`.toLocaleLowerCase().includes(term)));
}
