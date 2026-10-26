const albumUrl = id => `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzYzNzg5MjMyOQ==&action=getalbum&album_id=${id}#wechat_redirect`;

export const learningFolderItems = [
  { id: 'weekly', title: '零一周刊', href: albumUrl('4739817711382593536') },
  { id: 'thinking', title: '零一文章', href: albumUrl('4707060559798894592') },
  { id: 'experience', title: '零一大学', href: albumUrl('4739814244253466626') }
];

export const practiceFolderItems = [
  { id: 'hackathon', title: '零一黑客松', href: albumUrl('4711506613004959746') },
  { id: 'salon', title: '零一沙龙', href: albumUrl('4707063203418374148') },
  { id: 'business', title: '零一商业', href: albumUrl('4734259802745634816') },
  { id: 'research', title: '零一科研与竞赛', href: albumUrl('4739811477355003905') },
  { id: 'activities', title: '日常活动', href: albumUrl('4716909649869176840') }
];
