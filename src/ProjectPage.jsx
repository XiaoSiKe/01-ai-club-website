import { useEffect, useState } from 'react';
import { projects } from './data/projects';
import ProjectArtwork from './components/ProjectArtwork';
import './components/ProjectShowcase.css';
import './ProjectPage.css';

const knowledgeEntries = [
  { title: '大语言模型是什么？', label: '理解概念', text: '语言模型通过学习文本中的模式来生成内容。它可以辅助理解和创作，但输出仍需要核实。' },
  { title: '写出更清楚的提示词', label: '工具实践', text: '告诉工具你想完成什么、面向谁、有哪些材料和约束，再给出一个期待的输出样例。' },
  { title: '从一个小网页开始', label: '项目入门', text: '选择一个具体需求，画出最简单的页面，用 HTML 和 CSS 实现，再请一位同学实际试用。' },
  { title: '把笔记变成可分享的知识', label: '开源共建', text: '记录问题、尝试、结果和参考来源。清楚的过程，往往比单独的结论更有帮助。' },
];

function KnowledgeDemo() {
  const [query, setQuery] = useState('');
  const entries = knowledgeEntries.filter(entry => `${entry.title}${entry.label}${entry.text}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><label className="demo-label" htmlFor="knowledge-search">从一个问题开始</label><input id="knowledge-search" className="demo-input" type="search" placeholder="搜索概念、提示词、网页……" value={query} onChange={event => setQuery(event.target.value)} /><p className="demo-result-count" role="status">找到 {entries.length} 篇入门笔记</p><div className="demo-knowledge-list">{entries.map(entry => <article key={entry.title}><span>{entry.label}</span><h3>{entry.title}</h3><p>{entry.text}</p></article>)}</div>{entries.length === 0 && <p className="demo-empty">还没有这个主题的笔记。试试“提示词”或“网页”。</p>}</>;
}

function StudyDemo() {
  const [completed, setCompleted] = useState([]);
  const tasks = ['读懂一个新的 AI 概念', '完成一个 15 分钟的小实验', '写下今天的一个发现'];
  return <><div className="demo-study-summary"><div><span className="demo-label">今天，向前一点</span><strong>{completed.length}<small> / 3</small></strong></div><span className="demo-study-message" role="status">{completed.length === 3 ? '今天的小目标，完成了。' : '每一步都算数。'}</span></div><div className="demo-progress" role="progressbar" aria-label="今日任务进度" aria-valuemin={0} aria-valuemax={3} aria-valuenow={completed.length}><span style={{ transform: `scaleX(${completed.length / 3})` }} /></div><div className="demo-tasks">{tasks.map((task, index) => <label key={task}><input type="checkbox" checked={completed.includes(index)} onChange={() => setCompleted(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index])} /><span>{task}</span><small>{String(index + 1).padStart(2, '0')}</small></label>)}</div><p className="demo-footnote">这是一份可勾选的体验清单，刷新后可以重新开始。</p></>;
}

function StudioDemo() {
  const [topic, setTopic] = useState('让 AI 成为学习的小帮手');
  const [format, setFormat] = useState('一篇面向初学者的短文');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState('');
  const createPrompt = event => {
    event.preventDefault();
    setResult(`请围绕“${topic.trim()}”创作${format}。\n\n面向：对这个主题好奇、但还没有相关基础的大学生。\n表达：具体、亲切、清楚，少用术语。\n内容：从一个日常场景开始，解释核心想法，再给出一个今天就能尝试的小行动。\n要求：区分事实与建议，不编造数据或案例；对需要核实的内容明确提示。`);
    setCopied('');
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(result); setCopied('已复制，可以带到你常用的创作工具中。'); }
    catch { setCopied('请选中下方文字并手动复制。'); }
  };
  return <><form onSubmit={createPrompt}><label className="demo-label" htmlFor="studio-topic">你的主题</label><input id="studio-topic" className="demo-input" value={topic} onChange={event => setTopic(event.target.value)} maxLength={120} required /><label className="demo-label demo-label-spaced" htmlFor="studio-format">想尝试的形式</label><select id="studio-format" className="demo-input" value={format} onChange={event => setFormat(event.target.value)}><option>一篇面向初学者的短文</option><option>一份交流会分享提纲</option><option>一个一分钟短视频脚本</option></select><button className="demo-button" disabled={!topic.trim()} type="submit">整理创作提示 <span aria-hidden="true">↗</span></button></form>{result && <div className="demo-output" aria-live="polite"><label className="demo-label" htmlFor="studio-result">把这个起点带走</label><textarea id="studio-result" value={result} onChange={event => { setResult(event.target.value); setCopied(''); }} rows={9} /><button type="button" className="demo-text-button" onClick={copy}>复制提示词</button><p role="status">{copied}</p></div>}</>;
}

function ToolsDemo() {
  const [value, setValue] = useState('{"project":"从零到一","curiosity":true,"next":["learn","build","share"]}');
  const [message, setMessage] = useState('');
  const format = () => {
    try { setValue(JSON.stringify(JSON.parse(value), null, 2)); setMessage('整理好了，结构清楚多了。'); }
    catch { setMessage('这段 JSON 还不完整。请检查双引号、逗号和括号，再试一次。'); }
  };
  return <><label className="demo-label" htmlFor="json-input">JSON 整理工具</label><textarea id="json-input" className="demo-code" value={value} onChange={event => { setValue(event.target.value); setMessage(''); }} rows={9} spellCheck={false} /><button className="demo-button" type="button" onClick={format}>整理格式 <span aria-hidden="true">↗</span></button><p className="demo-feedback" role="status">{message}</p><p className="demo-footnote">内容只在你的浏览器中处理。</p></>;
}

const demos = { knowledge: KnowledgeDemo, study: StudyDemo, studio: StudioDemo, tools: ToolsDemo };

export default function ProjectPage({ projectId }) {
  const project = projects.find(item => item.id === projectId);
  useEffect(() => {
    const previous = document.title;
    document.title = project ? `${project.name} · 示例项目｜零一 AI 日新社` : '项目未找到｜零一 AI 日新社';
    return () => { document.title = previous; };
  }, [project]);

  if (!project) return <main className="project-page project-not-found"><p className="section-eyebrow">01AIClub / PROJECTS</p><h1>这个项目还没来到这里。</h1><p>回到官网，了解社团的探索方向。</p><a className="demo-button" href="./#directions">返回官网 ↗</a></main>;
  const Demo = demos[project.id];
  return <div className="project-page">
    <a className="skip-link" href="#project-main">跳到主要内容</a>
    <header className="project-page-header"><a href="./#directions" className="project-back"><span aria-hidden="true">←</span> 返回官网</a><a href="./#top" className="project-page-brand">01<span>AIClub</span></a></header>
    <main id="project-main" className="project-page-main">
      <section className="project-page-hero" aria-labelledby="project-page-title"><div><p className="section-eyebrow">PROJECT {project.number} / {project.english}</p><span className="project-detail-badge">示例项目 · 可交互体验</span><h1 id="project-page-title">{project.name}</h1><p className="project-page-tagline">{project.description}</p><p className="project-page-description">{project.detail}</p><a href="#project-demo" className="demo-button">体验一下 <span aria-hidden="true">↓</span></a></div><div className="project-page-art"><ProjectArtwork kind={project.id} /></div></section>
      <section className="project-demo-section" id="project-demo" aria-labelledby="demo-title"><div className="project-demo-intro"><p className="section-eyebrow">A SMALL FIRST STEP</p><h2 id="demo-title">先动手，试试看。</h2><p>一个小小的原型，<br />让想法变得具体。</p><span>示例体验，欢迎带着新想法来。</span></div><div className="project-demo-surface">{Demo ? <Demo /> : <p className="demo-empty">这个项目的体验正在准备中，欢迎先加入社群交流想法。</p>}</div></section>
      <section className="project-feature-grid" aria-label="项目构想">{project.features.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{text}</p></article>)}</section>
      <div className="project-page-invitation"><div><p className="section-eyebrow">FROM ZERO TO ONE</p><h2>下一个作品，也可以从你开始。</h2><p>这里展示的是项目构想与体验原型，欢迎一起把想法变成真实作品。</p></div><a href="./#join" className="demo-button">加入我们 <span aria-hidden="true">↗</span></a></div>
    </main><footer className="project-page-footer"><span>零一 AI 日新社 / 01AIClub</span><span>保持好奇，持续创造。</span></footer>
  </div>;
}
