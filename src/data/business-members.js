import { memberPortraits } from './member-portraits.js';

const membersWithPortraits = names => names.map(name => ({ name, src: memberPortraits[name] }));

// Member order and avatars supplied by the user for each project.
export const ezcutBusinessMembers = membersWithPortraits(['玉华', '徐裕恒', '吴耀辉', '零一扬']);
export const exdrinkBusinessMembers = membersWithPortraits(['王云重', 'San', 'Miracle', '零一扬']);
export const smartbotBusinessMembers = membersWithPortraits(['黄铉', '王云重', '零一扬']);
export const timetableBusinessMembers = membersWithPortraits(['Spark']);
