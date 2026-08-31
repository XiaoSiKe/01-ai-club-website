import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GridScan from './GridScan';
import EchoText from './EchoText';
import SpecularButton from './SpecularButton';
import StaggeredMenu from './StaggeredMenu';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const PRODUCT_NAME = '零一 AI 日新社';
const SLOGAN = '以 AI 为引擎，于零一之间探索，在日新之中迭代。';
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
const MENU_ITEMS = [
  { label: '首页', ariaLabel: '返回首页', link: '#hero-title' },
  { label: '关于日新社', ariaLabel: '了解零一 AI 日新社', link: '#about' },
  { label: '我们会做什么', ariaLabel: '了解社团发展方向', link: '#directions' },
  { label: '成长路径', ariaLabel: '查看社团成长路径', link: '#journey' },
  { label: '加入日新社', ariaLabel: '查看加入日新社说明', link: '#join' },
];
export default function App() {
  const pageRef = useRef(null);
  const scrollTweenRef = useRef(null);

  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finishNavigation = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      window.history.replaceState(null, '', `#${id}`);
    };

    scrollTweenRef.current?.kill();
    if (reduceMotion) {
      target.scrollIntoView({ block: 'start' });
      finishNavigation();
      return;
    }

    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const distance = Math.abs(targetY - window.scrollY);
    const duration = gsap.utils.clamp(0.8, 1.35, 0.72 + distance / 2200);

    scrollTweenRef.current = gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
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
          { opacity: 0.18, x: -32, clipPath: 'inset(0 100% 0 0)' },
          { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '.home-trust-panel',
          { opacity: 0.16, y: 42, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out', clearProps: 'opacity,transform,filter' },
          '-=0.55'
        )
        .fromTo(
          '.home-trust-card',
          { opacity: 0.14, y: 28 },
          { opacity: 1, y: 0, duration: 0.72, stagger: 0.11, ease: 'power3.out', clearProps: 'opacity,transform' },
          '-=0.58'
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-how-section', start: 'top 82%', once: true }
      })
        .fromTo(
          '#directions-title',
          { opacity: 0.18, x: 34, clipPath: 'inset(0 0 0 100%)' },
          { opacity: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.9, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '#journey > li',
          { opacity: 0.16, y: 28 },
          { opacity: 1, y: 0, duration: 0.72, ease: 'power3.out', clearProps: 'opacity,transform' },
          '-=0.5'
        )
        .fromTo(
          '.home-protocol-card',
          { opacity: 0.14, y: 48, scale: 0.985, filter: 'blur(6px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.86, stagger: 0.12, ease: 'power3.out', clearProps: 'opacity,transform,filter' },
          '-=0.38'
        )
        .fromTo(
          '.home-how-steps-continuation > li',
          { opacity: 0.16, x: -26 },
          { opacity: 1, x: 0, duration: 0.72, stagger: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' },
          '-=0.48'
        );

      gsap.timeline({
        scrollTrigger: { trigger: '.home-note', start: 'top 84%', once: true }
      })
        .fromTo(
          '.home-note .home-flow-title',
          { opacity: 0.18, y: 34, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.88, ease: 'power4.out', clearProps: 'opacity,transform,clip-path' }
        )
        .fromTo(
          '.home-note > p',
          { opacity: 0.16, y: 24, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.82, ease: 'power3.out', clearProps: 'opacity,transform,filter' },
          '-=0.48'
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
          scanOpacity={0.24}
          scanDuration={3.1}
          scanDelay={0.8}
          enablePost
          bloomIntensity={0.32}
          chromaticAberration={0.0009}
          noiseIntensity={0.005}
          scanGlow={0.29}
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
                <a className="hero-affiliation-link" href="#about">福州大学</a>
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
                  关于零一
                </SpecularButton>
                <SpecularButton
                  {...SPECULAR_BUTTON_PROPS}
                  className="hero-button"
                  onClick={() => scrollToSection('join')}
                >
                  加入日新社
                </SpecularButton>
              </div>
            </div>
          </div>
        </div>

        <div className="home-sections">
          <section className="home-section home-trust-section" id="about" aria-labelledby="about-title">
            <h2 className="home-flow-title" id="about-title" tabIndex="-1">
              从零开始，也由我们共同定义
            </h2>

            <div className="home-trust-panel">
              <p className="home-trust-intro">
                这里是「<strong>零一 AI 日新社｜01AIClub</strong>」，一个专属于 AI 开源探索者的知识库与交流社区。<br />
                社团成立于 2026 年 9 月 1 日，由<strong>零一扬</strong>担任社长，以公益教学为核心，一切仍在从零开始。
              </p>

              <div className="home-trust-cards">
                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">01</span>
                  <h3>公益教学</h3>
                  <p>陆续提供清晰、可实践的 AI 入门课程，让真正想学的人找到起点，也找到同行者。</p>
                  <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-trust-button" onClick={() => scrollToSection('directions')}>
                    看看我们会做什么 →
                  </SpecularButton>
                </article>

                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">02</span>
                  <h3>成长指导<br /><em>走得更稳</em></h3>
                  <p>围绕转专业与就业提供经验和方向支持，帮助大家理解选择，也承担自己的选择。</p>
                  <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-trust-button" onClick={() => scrollToSection('journey')}>
                    了解成长路径 →
                  </SpecularButton>
                </article>

                <article className="home-trust-card">
                  <span className="home-card-index" aria-hidden="true">03</span>
                  <h3>真实项目</h3>
                  <p>分发具体、可落地的项目，尝试帮助企业解决真实问题，让所学在实践中产生价值。</p>
                  <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-trust-button" onClick={() => scrollToSection('join')}>
                    和我们一起建设 →
                  </SpecularButton>
                </article>
              </div>
            </div>
          </section>

          <section className="home-section home-how-section" id="directions" aria-labelledby="directions-title">
            <h2 className="home-flow-title" id="directions-title" tabIndex="-1">我们会做什么？</h2>
            <ol className="home-how-steps" id="journey">
              <li>
                <span className="home-step-number">1</span>
                <div>
                  <h3>从一个真正能完成的小目标开始</h3>
                </div>
              </li>
            </ol>

            <div className="home-protocol-grid" role="region" aria-label="零一 AI 日新社的发展方向">
              <article className="home-protocol-card">
                <div className="home-protocol-top">
                  <span className="home-protocol-kicker">LEARN</span>
                  <span className="home-tier-badge home-tier-crypto">公益教学</span>
                </div>
                <h2>AI 入门课程</h2>
                <p>从基础概念到工具使用，从理解模型到完成第一个作品。内容会随着社区实践持续补充，而不是一次写完后停止更新。</p>
                <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-protocol-button" onClick={() => scrollToSection('join')}>
                  一起开始学习 →
                </SpecularButton>
              </article>

              <article className="home-protocol-card">
                <div className="home-protocol-top">
                  <span className="home-protocol-kicker">GROW</span>
                  <span className="home-tier-badge home-tier-behavioral">成长支持</span>
                </div>
                <h2>转专业与就业指导</h2>
                <p>分享路径选择、能力建设和求职准备中的真实经验，少一些信息差，多一些基于自身节奏的长期积累。</p>
                <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-protocol-button" onClick={() => scrollToSection('join')}>
                  找到同行伙伴 →
                </SpecularButton>
              </article>

              <article className="home-protocol-card">
                <div className="home-protocol-top">
                  <span className="home-protocol-kicker">BUILD</span>
                  <span className="home-tier-badge home-tier-protocol">项目实践</span>
                </div>
                <h2>可落地的真实项目</h2>
                <p>把具体问题拆成能够协作完成的任务，在解决真实需求的过程中学习，让作品、经验与贡献一同沉淀下来。</p>
                <SpecularButton {...SPECULAR_BUTTON_PROPS} size="md" className="home-protocol-button" onClick={() => scrollToSection('join')}>
                  参与项目共建 →
                </SpecularButton>
              </article>
            </div>

            <ol className="home-how-steps home-how-steps-continuation" start={2}>
              <li>
                <span className="home-step-number">2</span>
                <div>
                  <h3>在交流与实践中持续迭代</h3>
                  <p>学习不是独自收集资料。我们会把问题带进社区、把想法带进项目，让每一次讨论都尽量向行动靠近。</p>
                </div>
              </li>
              <li>
                <span className="home-step-number">3</span>
                <div>
                  <h3>参与社团，也参与它的成长</h3>
                  <p>社团仍处在最早期。每一位加入的同学，都有机会参与建设，和我们一起定义它未来的样子。</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="home-note" id="join" aria-labelledby="join-title" tabIndex="-1">
            <h2 className="home-flow-title" id="join-title">欢迎来到零一 AI 日新社</h2>
            <p>
              如果你也认可这种长期主义的节奏，欢迎加入，一起把这件事做下去。<br />
              目前很多事情都还在从零开始，但也正因为如此，你可以和我们一起参与它的成长。<br />
              <strong>一切才刚刚开始，朋友们。</strong>
            </p>
          </section>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <strong>零一 AI 日新社｜01AIClub</strong>
            <p>
              以 AI 为引擎，于零一之间探索，<br />
              在日新之中迭代。
            </p>
          </div>

          <div className="home-footer-links">
            <div className="home-footer-column">
              <h3>日新社</h3>
              <ul>
                <li><a href="#about">关于我们</a></li>
                <li><a href="#directions">发展方向</a></li>
                <li><a href="#journey">成长路径</a></li>
                <li><a href="#join">加入日新社</a></li>
              </ul>
            </div>

            <div className="home-footer-column">
              <h3>我们会做</h3>
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
          <span>© 2026 零一 AI 日新社 · 01AIClub</span>
          <a href="#hero-title" aria-label="返回零一 AI 日新社首页">
            <span>从零到一 · 日新又新</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
