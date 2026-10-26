import StaggeredMenu from '../StaggeredMenu';
import { ThemeToggle } from '../Theme';

const HOME_ITEMS = [
  { label: '首页', ariaLabel: '返回首页', link: '#top' },
  { label: '关于我们', ariaLabel: '了解零一 AI 日新社', link: '#about' },
  { label: '我们在做什么', ariaLabel: '了解社团正在开展的方向', link: '#directions' },
  { label: '零一商业', ariaLabel: '浏览零一商业', link: '#business' },
  { label: '零一科研与竞赛', ariaLabel: '浏览零一科研与竞赛', link: '#research' },
  { label: '零一合作生态', ariaLabel: '浏览合作品牌', link: '#partners' },
  { label: '零一高校分社', ariaLabel: '浏览零一高校分社地图', link: '#cooperation' },
  { label: '加入我们', ariaLabel: '查看加入我们的说明', link: '#join' },
];
const RETURN_ITEMS = HOME_ITEMS.map(item => ({ ...item, link: `./${item.link}` }));
const MENU_COLORS = ['var(--menu-layer-one)', 'var(--menu-layer-two)', 'var(--menu-layer-three)'];

export default function SiteNavigation({ standalone = false }) {
  return (
    <StaggeredMenu
      position="right"
      items={standalone ? RETURN_ITEMS : HOME_ITEMS}
      displaySocials={false}
      displayItemNumbering
      menuButtonColor="var(--site-ink)"
      openMenuButtonColor="var(--site-ink)"
      changeMenuColorOnOpen={false}
      colors={MENU_COLORS}
      logoUrl="/lingyi-logo.jpg"
      logoHref={standalone ? './#top' : '#top'}
      accentColor="var(--site-ink)"
      headerActions={<ThemeToggle />}
      isFixed
    />
  );
}
