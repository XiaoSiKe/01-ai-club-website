import { useLayoutEffect, useRef, useState } from 'react';
import Folder from './Folder';
import BorderGlow from '../BorderGlow';
import { useTheme } from '../Theme';
import { learningFolderItems, practiceFolderItems } from '../data/explore';
import SocialIcon from './SocialIcon';
import { socialChannels } from '../data/social';
import { RiUserStarLine, RiFlag2Line, RiCompass3Line, RiBookOpenLine, RiGraduationCapLine, RiBroadcastLine } from 'react-icons/ri';
import './ExploreSection.css';

const documentItems = (items, categories) => items.map((item, index) => ({
  ...item,
  content: (
    <span className="home-folder-document">
      <span className="home-folder-document__masthead"><span>01 AI CLUB</span><span aria-hidden="true">↗</span></span>
      <span className="home-folder-document__rule" />
      <strong className="home-folder-document__title">{item.id === 'research' ? <><span>零一科研</span><span>与竞赛</span></> : item.title}</strong>
      <span className="home-folder-document__category">{categories[index]}</span>
      <span className="home-folder-document__footer"><span className="home-folder-document__index">{String(index + 1).padStart(2, '0')}</span><span>阅读专栏</span></span>
    </span>
  ),
}));
const learningItems = documentItems(learningFolderItems, ['周刊 · 分享', '文章 · 观点', '大学 · 成长']);
const practiceItems = documentItems(practiceFolderItems, ['黑客松 · 造物', '沙龙 · 交流', '商业 · 产品', '科研 · 竞赛', '日常 · 相聚']);

export default function ExploreSection({ borderGlowProps, knowledgeUrl, onItemClick }) {
  const { theme } = useTheme();
  const [openFolder, setOpenFolder] = useState(null);
  const folderViewportRefs = useRef([]);

  useLayoutEffect(() => {
    if (openFolder !== null) return undefined;
    const centerFolders = () => {
      folderViewportRefs.current.forEach(viewport => {
        if (viewport) viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
      });
    };
    centerFolders();
    const observer = new ResizeObserver(centerFolders);
    folderViewportRefs.current.forEach(viewport => { if (viewport) observer.observe(viewport); });
    return () => observer.disconnect();
  }, [openFolder]);

  const entries = [
    { id: 'mentor', icon: RiUserStarLine, title: 'Mentor', href: './?page=mentors', label: '认识 Mentor' },
    { id: 'pioneers', icon: RiFlag2Line, title: '领航先锋', description: '保持好奇，彼此启发。', href: './?page=pioneers', label: '认识领航先锋' },
    { id: 'compass', icon: RiCompass3Line, title: '零一大学指南针', description: '大学生活与成长导航', href: 'https://compass.01aiedu.com/', label: '打开零一大学指南针（新窗口）', external: true },
    { id: 'knowledge', icon: RiBookOpenLine, title: '开源知识库', description: '一起学习，持续分享。', href: knowledgeUrl, label: '零一开源知识库（新窗口）', external: true },
    { id: 'branches', icon: RiGraduationCapLine, title: '零一高校分社', titleParts: ['零一', '高校分社'], description: '连接高校，找到身边的同伴。', href: '#cooperation', label: '探索零一高校分社' },
  ];

  return (
    <section className="home-section home-how-section" id="directions" aria-labelledby="directions-title">
      <header className="home-explore-heading">
        <h2 className="home-flow-title" id="directions-title" tabIndex={-1}>我们在做什么？</h2>
        <p className="home-directions-quote">那些疯狂到相信自己能够改变世界的人，正是改变世界的人！</p>
      </header>

      <div className="home-explore-bento">
        <nav className="home-explore-links" aria-label="探索入口">
          {entries.map(entry => {
            const Icon = entry.icon;
            return <BorderGlow key={entry.id} {...borderGlowProps} borderRadius={16} className={`home-explore-entry-frame home-explore-entry-frame--${entry.id}`}>
              <a className={`home-explore-link home-explore-link--${entry.id}`} href={entry.href}
                aria-label={entry.label} target={entry.external ? '_blank' : undefined}
                rel={entry.external ? 'noopener noreferrer' : undefined} data-external={entry.external || undefined}>
                <Icon className="home-explore-module-icon" aria-hidden="true" />
                <div className="home-explore-link-copy">
                  <h3>{entry.id === 'compass' ? <><span>零一大学</span><span>指南针</span></> : <span>{entry.titleParts ? entry.titleParts.map(part => <span className="home-explore-word" key={part}>{part}</span>) : entry.title}</span>}</h3>
                  {entry.description && <p>{entry.description}</p>}
                </div>
                <span className="home-explore-link-arrow" aria-hidden="true">{entry.external ? '↗' : '→'}</span>
              </a>
            </BorderGlow>;
          })}
          <BorderGlow {...borderGlowProps} borderRadius={16} className="home-explore-entry-frame home-explore-entry-frame--media">
            <article className="home-explore-media-card" aria-labelledby="home-media-title">
              <h3 id="home-media-title"><RiBroadcastLine aria-hidden="true" /><span><span className="home-explore-word">零一</span><span className="home-explore-word">自媒体</span></span></h3>
              <p>记录学习、实践与日常。</p>
              <div className="home-explore-socials" aria-label="零一自媒体平台">
                {socialChannels.map(channel => {
                  const Platform = channel.href ? 'a' : 'span';
                  return <Platform key={channel.id} className="home-explore-social" href={channel.href || undefined}
                    target={channel.href ? '_blank' : undefined} rel={channel.href ? 'noopener noreferrer' : undefined}
                    role={channel.href ? undefined : 'img'} aria-label={channel.href ? `${channel.title}主页（新窗口）` : channel.title} title={channel.title}>
                    <SocialIcon platform={channel.id} /><span>{channel.title}</span>
                  </Platform>;
                })}
              </div>
            </article>
          </BorderGlow>
        </nav>

        <div className="home-explore-folders">
          {[
            { id: 'learn', title: '从零到一', label: '学习与分享', items: learningItems },
            { id: 'practice', title: '零一实践', label: '探索与实践', items: practiceItems },
          ].map((group, index) => (
            <BorderGlow key={group.id} {...borderGlowProps} borderRadius={16} className={`home-explore-folder-frame${openFolder === group.id ? ' is-open' : ''}`}>
              <article className="home-explore-folder-card">
                <header className="home-explore-card-heading">
                  <p className="home-explore-card-kicker">{group.label}</p>
                  <h3>{group.title}</h3>
                </header>
                <div className="home-explore-folder-viewport" ref={node => { folderViewportRefs.current[index] = node; }}>
                  <div className="home-explore-folder-space">
                    <Folder label={group.title} items={group.items} color="#18181b" paperColor="#f2f2f0" theme={theme} intro documentScale={1.276}
                      open={openFolder === group.id} onOpenChange={open => setOpenFolder(open ? group.id : null)} onItemClick={onItemClick} />
                  </div>
                </div>
              </article>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
