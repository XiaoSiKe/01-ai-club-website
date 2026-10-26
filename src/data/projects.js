// 示例项目集中维护于此。接入真实项目时，替换文案并填写 url；
// url 留空时，卡片打开本站可独立访问的示例项目页。
export const projects = [
  {
    id: 'knowledge',
    number: '01',
    name: '智识 · AI 知识库',
    english: 'OPEN KNOWLEDGE',
    category: '知识共建',
    description: '把走过的路，变成后来者的起点。',
    detail: '从第一个 AI 概念到第一次动手实践，把零散的经验整理成清晰、可检索的学习地图。',
    tags: ['学习路径', '开源共建'],
    url: '',
    demo: true,
    features: [
      ['从问题出发', '按正在遇到的问题找到合适的入门材料。'],
      ['把经验留下', '让每一次学习的笔记，成为下一位同学的路标。'],
      ['在实践中更新', '用作品验证理解，再把新的发现补回知识库。'],
    ],
  },
  {
    id: 'study',
    number: '02',
    name: '共学 · 学习搭子',
    english: 'LEARN TOGETHER',
    category: '社区实验',
    description: '一个小目标，一段一起前进的时间。',
    detail: '把一个模糊的学习愿望拆成今天能够完成的小任务，和同路人一起记录进展。',
    tags: ['每日实践', '同伴协作'],
    url: '',
    demo: true,
    features: [
      ['从小处开始', '先完成一件具体的小事，让学习有清楚的起点。'],
      ['看见自己的进度', '把完成的任务留下来，积累可以回看的成长记录。'],
      ['交换一个发现', '用分享和提问，让一个人的学习变成彼此的启发。'],
    ],
  },
  {
    id: 'studio',
    number: '03',
    name: '灵感 · AI 创作台',
    english: 'IDEA TO REALITY',
    category: '创作工具',
    description: '让脑海里的第一束灵感，有处落笔。',
    detail: '从用途、受众与表达方式出发，组织一份清楚的创作提示，把想法推进到可以开始的那一步。',
    tags: ['创意表达', '提示词实验'],
    url: '',
    demo: true,
    features: [
      ['先说清楚想法', '把主题、目标和期待的表达写在同一张画布里。'],
      ['尝试不同角度', '用不同的创作形式重新观察同一个主题。'],
      ['带走一份起点', '得到可编辑的提示词，再交给自己熟悉的创作工具。'],
    ],
  },
  {
    id: 'tools',
    number: '04',
    name: '日新 · 开源工具箱',
    english: 'SMALL TOOLS, BIG HELP',
    category: '效率工具',
    description: '从日常的小麻烦，开始一次小创造。',
    detail: '收集学习与开发中常用的小工具，让一次动手解决的问题，成为大家都能使用的便利。',
    tags: ['轻量工具', '动手创造'],
    url: '',
    demo: true,
    features: [
      ['解决具体问题', '从整理数据、处理文字等真实的小需求开始。'],
      ['打开就能使用', '用简单明确的输入和反馈，减少不必要的步骤。'],
      ['保持可理解', '让小工具既能派上用场，也能成为学习开发的例子。'],
    ],
  },
];

export function projectHref(project) {
  return project.url || `?project=${encodeURIComponent(project.id)}`;
}
