// Condensed from the user-supplied Feishu page, section 二、社团系统与组织架构.
// Source: https://scn96l2kzmbn.feishu.cn/wiki/YU8hwHocpi4MBykKZHLcTldznic#MLkUdwvBOokuDwxhOVWcG8U4nWd

export const architectureSystems = [
  { id: 'leadership', type: 'management', title: '管理领导系统', summary: '确定方向、分工与授权，负责重大决策和复盘' },
  { id: 'coordination', type: 'management', title: '统筹调度系统', summary: '拆解任务、协调资源，跟进进度与验收' },
  { id: 'growth', type: 'business', title: '成长与先锋系统', summary: '招新培训、成员互助，培养领航先锋' },
  { id: 'content', type: 'business', title: '内容与传播系统', summary: '编写周刊与日报，负责社团内容传播' },
  { id: 'research', type: 'business', title: '科研实践系统', summary: '组织科研训练与课题研究，记录成果及贡献' },
  { id: 'business', type: 'business', title: '商业实践系统', summary: '验证真实需求，推进产品开发、交付与运营' },
  { id: 'knowledge', type: 'business', title: '知识与技术系统', summary: '维护知识库、网站与开源工具，沉淀实践成果' },
  { id: 'resources', type: 'business', title: '资源与合作系统', summary: '对接导师与合作伙伴，连接工具、算力和场地' },
  { id: 'finance', type: 'business', title: '财务与资产系统', summary: '管理预算、收支与公共资产，分工记账和复核' },
];

export const architectureRoles = [
  { title: '核心团队', summary: '把握方向，统筹全局' },
  { title: '领航先锋', summary: '发起项目，带领实践', href: './?page=pioneers' },
  { title: '零一社员', summary: '自由参与，共同成长' },
];

export const architectureWorkflow = ['确定目标', '拆解任务', '执行更新', '指定验收', '成果归档', '定期复盘'];
