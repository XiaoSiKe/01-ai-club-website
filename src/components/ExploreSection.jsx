import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import ViewportMount from './ViewportMount';
import BorderGlow from '../BorderGlow';
import { useTheme } from '../Theme';
import { learningFolderItems, practiceFolderItems } from '../data/explore';
import SocialIcon from './SocialIcon';
import ExploreModuleIcon, { ExploreBookIcon } from './ExploreModuleIcon';
import { socialChannels } from '../data/social';
import { RiUserStarLine, RiFlag2Line, RiCompass3Line, RiGraduationCapLine, RiBroadcastLine, RiUserAddLine } from 'react-icons/ri';
import './ExploreSection.css';
const Folder = lazy(() => import('./Folder'));
const mediaChannels = socialChannels.filter(channel => channel.id !== 'channels');

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
const practiceItems = documentItems(practiceFolderItems, ['黑客松 · 创造', '沙龙 · 交流', '商业 · 产品', '科研 · 竞赛', '日常 · 耍起']);

export default function ExploreSection({ borderGlowProps, knowledgeUrl, onItemClick }) {
  const { theme } = useTheme();
  const [openFolder, setOpenFolder] = useState(null);
  const folderViewportRefs = useRef([]);

  useLayoutEffect(() => {
    const viewportWidths = new WeakMap();
    const centerFolders = () => {
      folderViewportRefs.current.forEach(viewport => {
        if (!viewport || viewportWidths.get(viewport) === viewport.clientWidth) return;
        viewportWidths.set(viewport, viewport.clientWidth);
        viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
      });
    };
    centerFolders();
    const observer = new ResizeObserver(centerFolders);
    folderViewportRefs.current.forEach(viewport => { if (viewport) observer.observe(viewport); });
    return () => observer.disconnect();
  }, []);

  const entries = [
    { id: 'mentor', icon: RiUserStarLine, title: '启航导师', description: '站在巨人的肩膀上', href: './?page=mentors', label: '认识启航导师' },
    { id: 'pioneers', icon: RiFlag2Line, title: '领航先锋', description: '我们相信，满怀热情的人能让世界变得更好', href: './?page=pioneers', label: '认识领航先锋' },
    { id: 'compass', icon: RiCompass3Line, title: '零一大学指南针', titleParts: ['零一大学', '指南针'], description: '大学生活与成长导航', href: 'https://compass.01aiedu.com/', label: '打开零一大学指南针（新窗口）', external: true },
    { id: 'knowledge', icon: ExploreBookIcon, title: '开源知识库', description: '让想法流动起来', href: knowledgeUrl, label: '零一开源知识库（新窗口）', external: true },
    { id: 'branches', icon: RiGraduationCapLine, title: '零一高校分社', titleParts: ['零一', '高校分社'], description: '团结一切可以团结的力量', href: '#cooperation', label: '探索零一高校分社' },
    { id: 'architecture', icon: RiUserAddLine, title: '加入零一', description: '从零到一，让技术进步成为每个人的机会', href: '#join', label: '加入零一，查看加入我们' },
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
                <ExploreModuleIcon kind={entry.id} icon={Icon} />
                <div className="home-explore-link-copy">
                  <h3><span>{entry.titleParts ? entry.titleParts.map(part => <span className="home-explore-word" key={part}>{part}</span>) : entry.title}</span></h3>
                  {entry.description && <p>{entry.description}</p>}
                </div>
                <span className="home-explore-link-arrow" aria-hidden="true">{entry.external ? '↗' : '→'}</span>
              </a>
            </BorderGlow>;
          })}
          <BorderGlow {...borderGlowProps} borderRadius={16} className="home-explore-entry-frame home-explore-entry-frame--media">
            <article className="home-explore-media-card" aria-labelledby="home-media-title">
              <ExploreModuleIcon kind="media" icon={RiBroadcastLine} />
              <h3 id="home-media-title"><span><span className="home-explore-word">零一</span><span className="home-explore-word">自媒体</span></span></h3>
              <p>记录学习、实践与日常</p>
              <div className="home-explore-socials" aria-label="零一自媒体平台">
                {mediaChannels.map(channel => {
                  const Platform = channel.href ? 'a' : 'span';
                  return <Platform key={channel.id} className="home-explore-social" href={channel.href || undefined}
                    target={channel.href ? '_blank' : undefined} rel={channel.href ? 'noopener noreferrer' : undefined}
                    role={channel.href ? undefined : 'img'} aria-label={channel.href ? `${channel.title}主页（新窗口）` : channel.title}>
                    <SocialIcon platform={channel.id} />
                  </Platform>;
                })}
              </div>
            </article>
          </BorderGlow>
        </nav>

        <div className="home-explore-folders">
          {[
            { id: 'learn', title: '从零到一', label: '学习与分享', items: learningItems },
            { id: 'practice', title: '零一实践', label: '探索与创新', items: practiceItems },
          ].map((group, index) => (
            <BorderGlow key={group.id} {...borderGlowProps} borderRadius={16} className={`home-explore-folder-frame${openFolder === group.id ? ' is-open' : ''}`}>
              <article className="home-explore-folder-card">
                <header className="home-explore-card-heading">
                  <p className="home-explore-card-kicker">{group.label}</p>
                  <h3>{group.title}</h3>
                </header>
                <div className="home-explore-folder-viewport" ref={node => { folderViewportRefs.current[index] = node; }}>
                  <div className="home-explore-folder-space">
                    <ViewportMount className="home-explore-folder-mount" minHeight={194.04}>
                    <Suspense fallback={null}>
                    <Folder label={group.title} items={group.items} size={0.99} color="#141416" paperColor="#f2f2f0" theme={theme} intro stationary peek documentScale={1.276}
                      open={openFolder === group.id} onOpenChange={open => setOpenFolder(open ? group.id : null)} onItemClick={onItemClick} />
                    </Suspense>
                    </ViewportMount>
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
