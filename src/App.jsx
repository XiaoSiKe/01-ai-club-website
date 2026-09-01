import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript } from 'react-icons/si';
import GridScan from './GridScan';
import EchoText from './EchoText';
import SpecularButton from './SpecularButton';
import StaggeredMenu from './StaggeredMenu';
import BorderGlow from './BorderGlow';
import LogoLoop from './LogoLoop';
import joinQrAvif from './assets/join-qq-qr.avif';
import joinQrPng from './assets/join-qq-qr.png';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const PRODUCT_NAME = '零一 AI 日新社';
const SLOGAN = '以 AI 为引擎，于零一之间探索，在日新之中迭代。';
const LEARNING_WIKI_URL = 'https://scn96l2kzmbn.feishu.cn/wiki/DDaiw0qKoifo7jkd2H2c9mxhnYe';
const ECHO_TEXT_PROPS = {
  echoes: 12,
  lag: 0.24,
  offset: 36,
  direction: 'right',
  fade: 0.72,
  blur: 3,
  tint: '#a3a3a3',
  mode: 'both',
  cursorRadius: 320,
  duration: 900,
  ease: 'ease-out',
  fontSize: 'clamp(3rem, 9vw, 7rem)',
  fontWeight: 800,
  color: '#f5f5f5',
};
const SPECULAR_BUTTON_PROPS = {
  size: 'lg',
  radius: 18,
  tint: '#ffffff',
  tintOpacity: 0,
  blur: 0,
  textColor: '#f5f5f5',
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1,
  shineSize: 10,
  shineFade: 40,
  thickness: 1,
  speed: 0.35,
  followMouse: true,
  proximity: 250,
  autoAnimate: false,
};
const BORDER_GLOW_PROPS = {
  edgeSensitivity: 30,
  backgroundColor: '#000000',
  borderRadius: 28,
  glowRadius: 40,
  glowIntensity: 1.0,
  coneSpread: 25,
  animated: false,
};
const TECH_LOGOS = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
];
const MENU_ITEMS = [
  { label: '首页', ariaLabel: '返回首页', link: '#hero-title' },
  { label: '关于日新社', ariaLabel: '了解零一 AI 日新社', link: '#about' },
  { label: '我们在做什么', ariaLabel: '了解社团正在开展的方向', link: '#directions' },
  { label: '加入我们', ariaLabel: '查看加入我们的说明', link: '#join' },
];
export default function App() {
  const pageRef = useRef(null);
  const scrollTweenRef = useRef(null);

  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const destinationY = id === 'hero-title' || id === 'top'
      ? 0
      : Math.max(0, targetY - 88);
    const finishNavigation = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      window.history.replaceState(null, '', `#${id}`);
    };

    scrollTweenRef.current?.kill();
    if (reduceMotion) {
      window.scrollTo({ top: destinationY });
      finishNavigation();
      return;
    }

    const distance = Math.abs(destinationY - window.scrollY);
    const duration = gsap.utils.clamp(0.62, 1.05, 0.56 + distance / 2600);

    scrollTweenRef.current = gsap.to(window, {
      scrollTo: { y: destinationY, autoKill: true },
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: finishNavigation
    });
  }, []);

  const handleInternalLinkClick = useCallback((event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    event.preventDefault();
    scrollToSection(decodeURIComponent(href.slice(1)));
  }, [scrollToSection]);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .fromTo(
          '.staggered-menu-header',
          { autoAlpha: 0, y: -18 },
          { autoAlpha: 1, y: 0, duration: 0.85, clearProps: 'opacity,visibility,transform' }
        )
        .fromTo(
          '.release-pill',
          { autoAlpha: 0, y: 20, scale: 0.96, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, clearProps: 'opacity,visibility,transform,filter' },
          0.12
        )
        .fromTo(
          '.title-echo',
          { autoAlpha: 0, y: 34, scale: 0.975, filter: 'blur(10px)' },
          { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.05, clearProps: 'opacity,visibility,transform,filter' },
          0.2
        )
        .fromTo(
          '.slogan-echo',
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, clearProps: 'opacity,visibility,transform,filter' },
          0.38
        )
        .fromTo(
          ['.hero-meta-row', '.hero-proof', '.hero-actions'],
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.1, clearProps: 'opacity,visibility,transform' },
          0.52
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-trust-section', start: 'top 80%', once: true }
      })
        .fromTo(
          '#about-title',
          { opacity: 0.42, x: -22, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.58, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '.home-trust-glow',
          { opacity: 0.4, y: 28 },
          { opacity: 1, y: 0, duration: 0.58, ease: 'power4.out', clearProps: 'opacity,transform' },
          '-=0.36'
        )
        .fromTo(
          '.home-trust-card',
          { opacity: 0.38, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power4.out', clearProps: 'opacity,transform' },
          '-=0.42'
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-how-section', start: 'top 82%', once: true }
      })
        .fromTo(
          '#directions-title',
          { opacity: 0.42, x: 22, clipPath: 'inset(0 0 0 100%)' },
          { opacity: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.58, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '.home-protocol-glow',
          { opacity: 0.38, y: 28, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.56, stagger: 0.08, ease: 'power4.out', clearProps: 'opacity,transform' },
          '-=0.38'
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-note', start: 'top 84%', once: true }
      })
        .fromTo(
          '.home-note .home-flow-title',
          { opacity: 0.42, y: 22, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.58, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '.home-note > p',
          { opacity: 0.4, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power4.out', clearProps: 'opacity,transform' },
          '-=0.36'
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-footer', start: 'top 88%', once: true }
      })
        .fromTo(
          '.home-footer-brand',
          { opacity: 0.18, x: -28 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform' }
        )
        .fromTo(
          '.home-footer-column',
          { opacity: 0.16, y: 26 },
          { opacity: 1, y: 0, duration: 0.72, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' },
          '-=0.5'
        )
        .fromTo(
          '.home-footer-copyright',
          { opacity: 0.18, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', clearProps: 'opacity,transform' },
          '-=0.34'
        );
    }, root);

    ScrollTrigger.refresh();
    return () => {
      scrollTweenRef.current?.kill();
      context.revert();
    };
  }, []);

  return (
    <div ref={pageRef} className="homepage" id="top" onClickCapture={handleInternalLinkClick}>
      <a className="skip-link" href="#hero-title">跳到主要内容</a>

      <div className="homepage-background" aria-hidden="true">
        <GridScan
          sensitivity={0.38}
          lineThickness={1}
          linesColor="#000000"
          gridScale={0.1}
          scanColor="#ffffff"
          scanOpacity={0.21}
          scanDuration={3.6}
          scanDelay={0.9}
          enablePost
          bloomIntensity={0.28}
          chromaticAberration={0.0009}
          noiseIntensity={0.005}
          scanGlow={0.26}
        />
      </div>

      <StaggeredMenu
        position="right"
        items={MENU_ITEMS}
        displaySocials={false}
        displayItemNumbering
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen
        colors={['#ffffff', '#8a8a8a', '#000000']}
        logoUrl="/lingyi-logo.jpg"
        accentColor="#ffffff"
        isFixed
      />

      <main className="hero" aria-labelledby="hero-title">
        <div className="hero-stage" style={{ width: '100%', height: '100dvh', position: 'relative' }}>
          <div className="hero-vignette" aria-hidden="true" />

          <div className="hero-content">
            <p className="release-pill">
              <b>01</b>
              <span>FZU AI CLUB</span>
            </p>

            <h1 id="hero-title" className="echo-viewport title-echo" aria-label={PRODUCT_NAME} tabIndex="-1">
              <span className="echo-scale">
                <EchoText {...ECHO_TEXT_PROPS} text={PRODUCT_NAME} />
              </span>
            </h1>

            <p className="echo-viewport slogan-echo">
              <span className="echo-scale">
                <EchoText {...ECHO_TEXT_PROPS} text={SLOGAN} />
              </span>
            </p>

            <div className="hero-lower">
              <div className="hero-meta-row">
                <a className="hero-affiliation-link" href="#about">福州大学学生社团</a>
                <a className="hero-license-link" href="#about">成立于 · 2026.09.01</a>
              </div>

              <div className="hero-proof">
                <p className="hero-proof-meta">
                  从零到一 · AI 入门 · 成长指导 · 真实项目 · 开源共建
                </p>
              </div>

              <div className="hero-actions">
                <SpecularButton
                  {...SPECULAR_BUTTON_PROPS}
                  className="hero-button"
                  onClick={() => scrollToSection('about')}
                >
                  关于日新社
                </SpecularButton>
                <SpecularButton
                  {...SPECULAR_BUTTON_PROPS}
                  className="hero-button"
                  onClick={() => scrollToSection('join')}
                >
                  加入我们
                </SpecularButton>
              </div>
            </div>
          </div>
        </div>

        <div className="home-sections">
          <section className="home-section home-trust-section" id="about" aria-labelledby="about-title">
            <h2 className="home-flow-title" id="about-title" tabIndex="-1">
              关于日新社
            </h2>

            <BorderGlow {...BORDER_GLOW_PROPS} className="home-trust-glow">
              <div className="home-trust-panel">
                <div className="home-trust-intro">
                <h3 className="home-trust-subtitle">从零到一，日新月异</h3>
                <p>
                  这里是「<strong>零一 AI 日新社｜01 AI Club</strong>」，一个立足福州大学，以开源知识库与交流社区为载体的 AI 学生社团。<br />
                  我们以公益教学为核心，帮助真正想学习 AI 的人找到起点，<br />
                  在交流与实践中迈出第一步，完成属于自己的<strong>从零到一</strong>。
                </p>
                <p>
                  零一日新社面向全社会 AI 爱好者开放，不限身份、专业与基础。<br />
                  只要保持好奇、愿意学习与实践，都欢迎加入我们！
                </p>
                <p>
                  <strong>以 AI 为引擎，于零一之间探索，在日新之中迭代！</strong><br />
                  我们相信，成长不必一蹴而就。每天多理解一点、多实践一步、多进步一点，这便是“<strong>日新</strong>”的意义。
                </p>
                <p>零一日新社成立于 2026 年 9 月 1 日，由 <strong>零一扬</strong> 担任社长。</p>
                </div>

                <div className="home-trust-cards">
                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">01</span>
                  <h3>开源共享</h3>
                  <p>零一日新社 坚持 零一精神，<br />是敢于从零开始，也愿意把走过的路开源给后来者。</p>
                  <p>我们将持续沉淀并开放课程、经验与优质资源，<br />让一次从零到一的探索成为更多人的起点。</p>
                </article>

                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">02</span>
                  <h3>探索实践</h3>
                  <p>零一日新社 相信，真正的能力始于探索，成于实践。</p>
                  <p>我们陪伴每一位探索者从理解第一个概念、完成第一个作品，到参与真实项目，让想法在行动中落地，<br />让每个人都有完成从零到一的勇气与能力。</p>
                </article>

                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">03</span>
                  <h3>长期共建</h3>
                  <p>
                    零一日新社 坚持用长期主义建设一个开源社区。<br />
                    从零到一需要迈出第一步，<br />日新则来自每一天的学习、实践与积累。
                  </p>
                  <p>我们期待每一位成员既是学习者，也是建设者。</p>
                </article>
                </div>
              </div>
            </BorderGlow>
          </section>

          <section className="home-section home-how-section" id="directions" aria-labelledby="directions-title">
            <h2 className="home-flow-title" id="directions-title" tabIndex="-1">我们在做什么？</h2>

            <div className="home-protocol-grid" role="region" aria-label="零一 AI 日新社的发展方向">
              <BorderGlow {...BORDER_GLOW_PROPS} className="home-protocol-glow">
                <article className="home-protocol-card">
                  <div className="home-protocol-top">
                    <span className="home-protocol-kicker">LEARN</span>
                    <span className="home-tier-badge home-tier-crypto">公益教学</span>
                  </div>
                  <h2>AI 入门课程</h2>
                  <p>
                    围绕人工智能基础概念、工具应用、模型理解与项目实践，<br />
                    逐步构建系统、清晰、可实践的学习路径。<br />
                    课程内容将随技术发展与社区实践持续更新，帮助社团成员从零到一。
                  </p>
                  <SpecularButton
                    {...SPECULAR_BUTTON_PROPS}
                    size="md"
                    className="home-protocol-button"
                    href={LEARNING_WIKI_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    一起开始学习 →
                  </SpecularButton>
                </article>
              </BorderGlow>

              <BorderGlow {...BORDER_GLOW_PROPS} className="home-protocol-glow">
                <article className="home-protocol-card">
                  <div className="home-protocol-top">
                    <span className="home-protocol-kicker">GROW</span>
                    <span className="home-tier-badge home-tier-behavioral">成长支持</span>
                  </div>
                  <h2>转专业与就业指导</h2>
                  <p>
                    围绕专业方向选择、能力体系建设与职业发展规划，分享基于真实经历的经验与方法。<br />
                    我们尊重每一位成员的选择与成长节奏，<br />
                    致力于减少信息差，帮助大家建立清晰、稳健、可持续的发展路径。
                  </p>
                  <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-protocol-button" onClick={() => scrollToSection('join')}>
                    找到同行伙伴 →
                  </SpecularButton>
                </article>
              </BorderGlow>

              <BorderGlow {...BORDER_GLOW_PROPS} className="home-protocol-glow">
                <article className="home-protocol-card">
                  <div className="home-protocol-top">
                    <span className="home-protocol-kicker">BUILD</span>
                    <span className="home-tier-badge home-tier-protocol">项目实践</span>
                  </div>
                  <h2>可落地的真实项目</h2>
                  <p>
                    面向真实需求开展项目实践，将复杂问题拆解为目标明确、责任清晰、成果可交付的协作任务。<br />
                    成员将在完整的项目过程中锻炼专业能力、解决问题的能力与团队协作意识，<br />
                    让所学转化为经得起实践检验的作品与贡献！
                  </p>
                  <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-protocol-button" onClick={() => scrollToSection('join')}>
                    参与项目共建 →
                  </SpecularButton>
                </article>
              </BorderGlow>
            </div>

          </section>

          <section className="home-note" id="join" aria-labelledby="join-title" tabIndex="-1">
            <h2 className="home-flow-title" id="join-title">欢迎加入零一 AI 日新社</h2>
            <p>
              如果你对 AI 技术保持好奇，愿意持续探索、实践与创造，欢迎加入零一 AI 日新社！<br />
              <strong>期待与你从零开始，一起创造更多可能。</strong>
            </p>
            <BorderGlow
              {...BORDER_GLOW_PROPS}
              className="home-join-qr-glow"
            >
              <picture className="home-join-qr-media">
                <source srcSet={joinQrAvif} type="image/avif" />
                <img
                  className="home-join-qr"
                  src={joinQrPng}
                  alt="零一 AI 日新社 QQ 群二维码"
                  width="640"
                  height="640"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </BorderGlow>
          </section>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <strong>零一 AI 日新社｜01AIClub</strong>
            <p>
              以 AI 为引擎，于零一之间探索，在日新之中迭代。
            </p>
            <LogoLoop
              logos={TECH_LOGOS}
              speed={90}
              direction="left"
              logoHeight={48}
              gap={40}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#0d0d0d"
              ariaLabel="技术栈"
              className="home-footer-logo-loop"
            />
          </div>

          <div className="home-footer-links">
            <div className="home-footer-column">
              <h3>日新社</h3>
              <ul>
                <li><a href="#about">关于我们</a></li>
                <li><a href="#directions">发展方向</a></li>
                <li><a href="#join">加入我们</a></li>
              </ul>
            </div>

            <div className="home-footer-column">
              <h3>我们在做</h3>
              <ul>
                <li><a href="#directions">AI 入门课程</a></li>
                <li><a href="#directions">转专业指导</a></li>
                <li><a href="#directions">就业指导</a></li>
                <li><a href="#directions">真实项目</a></li>
              </ul>
            </div>

            <div className="home-footer-column">
              <h3>发起人</h3>
              <ul>
                <li><a href="#about">社长 · 零一扬</a></li>
                <li><a href="#about">成立于 2026 年 9 月 1 日</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="home-footer-copyright">
          <span>版权所有 © 2026 福州大学 学生 零一 AI 日新社</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            ICP备案号：闽ICP备2026024313号-3
          </a>
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=35011102351280" target="_blank" rel="noopener noreferrer">
            闽公网安备35011102351280号
          </a>
        </div>
      </footer>
    </div>
  );
}
