import { memberPortraits } from './member-portraits.js';
import { pioneers } from './pioneers.js';

const pioneerByName = new Map(pioneers.map(member => [member.name, member]));
const membersWithPortraits = names => names.map(name => {
  const pioneer = pioneerByName.get(name);
  return {
    name,
    src: memberPortraits[name],
    href: pioneer ? `./?page=pioneers&member=${encodeURIComponent(pioneer.id)}` : undefined,
  };
});

// Member order and avatars supplied by the user for each project.
export const ezcutBusinessMembers = membersWithPortraits(['玉华', '徐裕恒', '吴耀辉']);
export const exdrinkBusinessMembers = membersWithPortraits(['王云重', 'San', 'Miracle']);
export const smartbotBusinessMembers = membersWithPortraits(['黄铉', '王云重']);
export const timetableBusinessMembers = membersWithPortraits(['Spark']);
export const physicsosBusinessMembers = membersWithPortraits(['冬思韦']);
