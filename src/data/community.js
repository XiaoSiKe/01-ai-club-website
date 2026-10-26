// Replace each example with real activity photos and captions when available.
// Keep isExample: true until the image and its description are factual.
export const communityMoments = [
  {
    id: 'salon',
    category: '交流与分享',
    title: '让好奇，发生在面对面之间。',
    description: '聊一个问题，分享一次尝试。让一个人的灵感，成为一群人的下一步。',
    image: '/images/community-salon.webp',
    imageAlt: 'AI 生成交流场景示意图：一位同学在投影屏幕前分享，其他同学在台下聆听',
    isExample: true,
  },
  {
    id: 'workshop',
    category: '一起动手',
    title: '想法，从动手开始。',
    description: '从一个小问题出发，试着把它做出来。工作坊可以记录探索过程，也可以留下还没解决的问题。',
    image: '/images/community-workshop.webp',
    imageAlt: 'AI 生成工作坊场景示意图：同学在笔记本电脑旁一起讨论手写草稿',
    isExample: true,
  },
  {
    id: 'together',
    category: '日常切片',
    title: '屏幕之外，也有同路人。',
    description: '值得留下的，不只有项目完成的那一刻。一起翻看笔记，聊聊新的发现，也能让我们更了解彼此。',
    image: '/images/community-together.webp',
    imageAlt: 'AI 生成社团日常场景示意图：四位同学在教室窗边一起翻看笔记并交流',
    isExample: true,
  },
];

// The QR and its decoded URL were supplied by the club. Add account when verified.
export const wechatChannel = {
  name: '零一 AI 日新社',
  account: '',
  url: 'http://weixin.qq.com/r/mp/PyMIEA-EpVLarUtz93Yt',
  qr: '/images/join-official-wechat-qr.jpg',
};

// Local, complete example articles. A real published article can use its own url.
export const communityPublications = [
  {
    id: 'first-question',
    category: '学习手记',
    title: '学习 AI，可以从一个自己的问题开始。',
    excerpt: '把庞大的技术话题，放回一个具体的小需求。',
    isExample: true,
    url: '',
    body: [
      '想学 AI 的时候，我们很容易先列出一长串需要掌握的名词。但真正让学习持续下去的，往往是一个和自己有关的问题。',
      '试着选一件每周都会重复的小事：整理课堂笔记、归纳阅读材料，或查找自己的文件。先写清楚现在怎么做、哪里最费力，以及什么结果才算有用。',
      '接着，用一个现成工具做最小的尝试。记录它做对了什么，又在哪些地方需要你检查。碰到的具体困难，会慢慢变成下一步学习的方向。',
      '如果愿意，把问题和过程带到交流中来。一个尚未完成的尝试，同样值得被分享。',
    ],
  },
  {
    id: 'small-project',
    category: '项目笔记',
    title: '一个小项目，也值得被认真完成。',
    excerpt: '从能运行，到能让另一个人顺利使用。',
    isExample: true,
    url: '',
    body: [
      '为项目增加功能很有吸引力。可在第一个版本里，最值得认真对待的事情，是让一件小事完整地发生。',
      '先用一句话说明：这个项目给谁用，在什么情况下，帮他完成什么。然后把流程走一遍，从打开页面到拿到结果，看看有没有只能靠作者解释才能通过的地方。',
      '请一位同学独立试用，观察他在哪里停住。记下反馈，修好最影响使用的一处，再请他试一次。',
      '当别人能顺利使用时，把入口、使用说明和已知限制一起留下。完成的标准，也就从“我的电脑能运行”向前走了一步。',
    ],
  },
  {
    id: 'good-conversation',
    category: '交流提案',
    title: '带着一个没想明白的问题来。',
    excerpt: '交流不必准备完美的答案，真实的困惑也有价值。',
    isExample: true,
    url: '',
    body: [
      '一次有收获的交流，可以从“这里我还不太明白”开始。提问并不意味着准备不足，它也可能说明你已经认真尝试过。',
      '分享时，先交代你想完成的事，再展示已经做过的尝试，最后说明卡住的具体位置。别人就更容易理解你的处境，也更容易给出有用的建议。',
      '听到建议后，可以一起挑一个最容易验证的办法。把下一次尝试缩小到一个动作，交流结束后就能动手。',
      '我们希望这里可以容纳半成品、不同观点和暂时没有答案的问题。持续交流的意义，也许就在于下一次仍然愿意带着新问题回来。',
    ],
  },
];
