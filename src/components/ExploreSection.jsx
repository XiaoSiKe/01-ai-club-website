import { useLanguage } from '../Language';
import { lazy, Suspense, useMemo, useLayoutEffect, useRef, useState } from 'react';
import ViewportMount from './ViewportMount';
import BorderGlow from '../BorderGlow';
import { useTheme } from '../Theme';
import { learningFolderItems, practiceFolderItems } from '../data/explore';
import SocialIcon from './SocialIcon';
import ExploreModuleIcon, { ExploreBookIcon } from './ExploreModuleIcon';
import { LoadingSlot } from './UniqueLoading';
import { socialChannels } from '../data/social';
import { RiUserStarLine, RiFlag2Line, RiTeamLine, RiCompass3Line, RiChat3Line, RiGraduationCapLine, RiBroadcastLine, RiOrganizationChart, RiUserAddLine } from 'react-icons/ri';
import './ExploreSection.css';
const Folder = lazy(() => import('./Folder'));
const mediaChannels = socialChannels.filter(channel => channel.id !== 'channels');

const documentItems = (items, categories, t, locale) => items.map((item, index) => ({
  ...item,
  content: (
    <span className="home-folder-document">
      <span className="home-folder-document__masthead"><span>01 AI CLUB</span><span aria-hidden="true">↗</span></span>
      <span className="home-folder-document__rule" />
      <strong className="home-folder-document__title">{item.id === 'research' && locale !== 'en' ? <><span>{t("零一科研")}</span><span>{t("与竞赛")}</span></> : t(item.title)}</strong>
      <span className="home-folder-document__category">{t(categories[index])}</span>
      <span className="home-folder-document__footer"><span className="home-folder-document__index">{String(index + 1).padStart(2, '0')}</span><span>{t("阅读专栏")}</span></span>
    </span>
  ),
}));

export default function ExploreSection({ borderGlowProps, knowledgeUrl, onItemClick }) {
  const { t, locale } = useLanguage();
  const folderGroups = useMemo(() => {
    const learningItems = documentItems(learningFolderItems, ['文章 · 观点', '大学 · 成长', '合作 · 共建'], t, locale);
    const practiceItems = documentItems(practiceFolderItems, ['黑客松 · 创造', '沙龙 · 交流', '商业 · 产品', '科研 · 竞赛', '日常 · 耍起'], t, locale);
    return [
      { id: 'learn', title: '从零到一', label: '学习与分享', items: learningItems },
      { id: 'practice', title: '零一实践', label: '探索与创新', items: practiceItems },
    ];
  }, [t, locale]);
  const { theme } = useTheme();
  const [openFolder, setOpenFolder] = useState(null);
  const [folderLayouts, setFolderLayouts] = useState(() => folderGroups.map(() => ({ size: .99, documentScale: 1.276, documentOffsetX: 0 })));
  const folderViewportRefs = useRef([]);

  useLayoutEffect(() => {
    const viewportWidths = new WeakMap();
    const centerFolders = () => {
      folderViewportRefs.current.forEach((viewport, index) => {
        if (!viewport || viewportWidths.get(viewport) === viewport.clientWidth) return;
        viewportWidths.set(viewport, viewport.clientWidth);
        const compact = window.matchMedia('(max-width: 760px)').matches;
        const size = compact ? Math.min(.5, Math.max(.3, (viewport.clientWidth - 12) / 224)) : .99;
        const frame = viewport.closest('.home-explore-folder-frame').getBoundingClientRect();
        const bounds = viewport.getBoundingClientRect();
        const width = 224 * size, count = folderGroups[index].items.length;
        const available = frame.width - 24, gap = 12 * size;
        const documentScale = compact ? Math.min(1.276, Math.max(1,
          (available - gap * (count - 1)) / (count * .94 * width * .54), available / (width * 2.3))) : 1.276;
        const documentOffsetX = compact ? frame.left + frame.width / 2 - bounds.left - bounds.width / 2 : 0;
        const layout = { size, documentScale, documentOffsetX };
        setFolderLayouts(previous => Object.keys(layout).every(key => previous[index][key] === layout[key]) ? previous : previous.map((value, i) => i === index ? layout : value));
        viewport.scrollLeft = Math.round(Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2));
      });
    };
    centerFolders();
    const observer = new ResizeObserver(centerFolders);
    folderViewportRefs.current.forEach(viewport => { if (viewport) observer.observe(viewport); });
    return () => observer.disconnect();
  }, []);

  const peopleEntries = [
    { id: 'mentor', icon: RiUserStarLine, title: '启航导师', description: '站在巨人的肩膀上', href: './?page=mentors', label: '认识启航导师' },
    { id: 'leadership', icon: RiFlag2Line, title: '领军团队', description: '我们要改变世界', href: './?page=leadership', label: '认识领军团队' },
    { id: 'pioneers', icon: RiTeamLine, title: '领航先锋', description: '当海盗，比加入海军更好', href: './?page=pioneers', label: '认识领航先锋' },
  ];
  const resourceEntries = [
    { id: 'compass', icon: RiCompass3Line, title: '零一大学指南针', titleParts: ['零一大学', '指南针'], description: '大学生活与成长导航', href: 'https://compass.01aiedu.com/', label: '打开零一大学指南针（新窗口）', external: true },
    { id: 'knowledge', icon: ExploreBookIcon, title: '开源知识库', description: '让想法流动起来', href: knowledgeUrl, label: '零一开源知识库（新窗口）', external: true },
    { id: 'feedback', icon: RiChat3Line, title: '建言献策', description: '批评与自我批评', href: 'https://scn96l2kzmbn.feishu.cn/wiki/GIh6woke5ilTbikyNNrcIUPdnJg', label: '建言献策（新窗口）', external: true },
  ];
  const branchesEntry = { id: 'branches', icon: RiGraduationCapLine, title: '零一高校分社', titleParts: ['零一', '高校分社'], description: '团结一切可以团结的力量', href: '#cooperation', label: '探索零一高校分社' };
  const teamEntries = [
    { id: 'architecture', icon: RiOrganizationChart, title: '战略与架构', description: '简单，有时比复杂更难', href: 'https://scn96l2kzmbn.feishu.cn/wiki/Pw4FwagW6iPaVqkzyeNc7rRSnub', label: '战略与架构（新窗口）', external: true },
    { id: 'join', icon: RiUserAddLine, title: '加入零一', description: '充满热情的人，能够让世界变得更好', href: '#recruitment', label: '加入零一，查看团队招募' },
  ];

  const renderEntry = entry => (
    <BorderGlow key={entry.id} {...borderGlowProps} borderRadius={16} className={`home-explore-entry-frame home-explore-entry-frame--${entry.id}`}>
      <a className={`home-explore-link home-explore-link--${entry.id}`} href={entry.href}
        aria-label={t(entry.label)} target={entry.external ? '_blank' : undefined}
        rel={entry.external ? 'noopener noreferrer' : undefined}>
        <ExploreModuleIcon kind={entry.id} icon={entry.icon} />
        <div className="home-explore-link-copy">
          <h3><span>{entry.titleParts ? entry.titleParts.map(part => <span className="home-explore-word" key={part}>{t(part)}</span>) : t(entry.title)}</span></h3>
          {entry.description && <p>{t(entry.description)}</p>}
        </div>
        <span className="home-explore-link-arrow" aria-hidden="true">↗</span>
      </a>
    </BorderGlow>
  );

  return (
    <section className="home-section home-how-section" id="directions" aria-labelledby="directions-title">
      <header className="home-explore-heading">
        <h2 className="home-flow-title" id="directions-title" tabIndex={-1}>{t("我们在做什么？")}</h2>
        <p className="home-directions-quote">{t("那些疯狂到相信自己能够改变世界的人，正是改变世界的人！")}</p>
      </header>

      <div className="home-explore-bento">
        <nav className="home-explore-links" aria-label={t("探索入口")}>
          <div className="home-explore-people">{peopleEntries.map(renderEntry)}</div>
          <div className="home-explore-resources">{resourceEntries.map(renderEntry)}</div>
          <div className="home-explore-bottom">
            {renderEntry(branchesEntry)}
            {teamEntries.map(renderEntry)}
            <BorderGlow {...borderGlowProps} borderRadius={16} className="home-explore-entry-frame home-explore-entry-frame--media">
              <article className="home-explore-media-card" aria-labelledby="home-media-title">
                <ExploreModuleIcon kind="media" icon={RiBroadcastLine} />
                <h3 id="home-media-title"><span><span className="home-explore-word">{t("零一")}</span><span className="home-explore-word">{t("自媒体")}</span></span></h3>
                <p>{t("记录学习、实践与日常")}</p>
                <div className="home-explore-socials" aria-label={t("零一自媒体平台")}>
                  {mediaChannels.map(channel => {
                    const Platform = channel.href ? 'a' : 'span';
                    return <Platform key={channel.id} className="home-explore-social" href={channel.href || undefined}
                      target={channel.href ? '_blank' : undefined} rel={channel.href ? 'noopener noreferrer' : undefined}
                      role={channel.href ? undefined : 'img'} aria-label={channel.href ? t("{0}主页（新窗口）", [channel.title]) : t(channel.title)}>
                      <SocialIcon platform={channel.id} />
                    </Platform>;
                  })}
                </div>
              </article>
            </BorderGlow>
          </div>
        </nav>

        <div className="home-explore-folders">
          {folderGroups.map((group, index) => (
            <BorderGlow key={group.id} {...borderGlowProps} borderRadius={16} className={`home-explore-folder-frame${openFolder === group.id ? ' is-open' : ''}`}>
              <article className="home-explore-folder-card">
                <header className="home-explore-card-heading">
                  <p className="home-explore-card-kicker">{t(group.label)}</p>
                  <h3>{t(group.title)}</h3>
                </header>
                <div className="home-explore-folder-viewport" ref={node => { folderViewportRefs.current[index] = node; }}>
                  <div className="home-explore-folder-space">
                    <ViewportMount className="home-explore-folder-mount" minHeight={196 * folderLayouts[index].size}>
                    <Suspense fallback={<LoadingSlot />}>
                    <Folder label={t(group.title)} items={group.items} size={folderLayouts[index].size} color="#141416" paperColor="#f2f2f0" theme={theme} intro stationary peek
                      documentScale={folderLayouts[index].documentScale} documentOffsetX={folderLayouts[index].documentOffsetX}
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
