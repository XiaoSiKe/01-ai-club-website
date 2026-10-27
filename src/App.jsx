import { lazy, Suspense, useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SiGithub, SiQq, SiX } from 'react-icons/si';
import SiteBackground from './components/SiteBackground';
import ViewportMount from './components/ViewportMount';
import ResponsiveImage from './components/ResponsiveImage';
import { imageSource } from './components/imageSource';
import EchoText from './EchoText';
import { BRAND_ECHO_PROPS as ECHO_TEXT_PROPS } from './components/EchoText/brandEchoProps';
import SpecularButton from './SpecularButton';
import SiteNavigation from './components/SiteNavigation';
import BorderGlow from './BorderGlow';
import LogoLoop from './LogoLoop';
import ExploreSection from './components/ExploreSection';
import LogoMarquee from './components/LogoMarquee';
import BranchAtlas from './components/BranchAtlas';
import ResearchSection from './components/ResearchSection';
import ShutterWordmark from './components/ShutterWordmark';
import PerspectiveTunnelHero from './components/ui/perspective-tunnel-hero';
import SocialIcon from './components/SocialIcon';
import { socialChannels, telegramChannel } from './data/social';
import { businesses } from './data/business';
import { wechatChannel } from './data/community';
import { useTheme } from './Theme';
import joinQr from './assets/join-qq-qr.webp';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
const FlexCarousel = lazy(() => import('./FlexCarousel'));

const PRODUCT_NAME = '零一 AI 日新社';
const SLOGAN = '从零到一，让技术进步成为每个人的机会';
const SLOGAN_EN = 'From Zero to One, Turning Technology into Opportunity for Everyone';
const LEARNING_WIKI_URL = 'https://scn96l2kzmbn.feishu.cn/wiki/DDaiw0qKoifo7jkd2H2c9mxhnYe';
const SPECULAR_BUTTON_PROPS = {
  size: 'lg',
  radius: 18,
  tint: '#ffffff',
  tintOpacity: 0,
  blur: 0,
  textColor: '#f5f5f5',
  lineColor: '#ffffff',
  baseColor: '#525252',
  intensity: 1.875,
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
  backgroundColor: 'var(--site-surface)',
  borderRadius: 28,
  glowRadius: 40,
  glowIntensity: 2.1,
  coneSpread: 25,
  animated: false,
};
const footerMask = (source, scale = 1) => ({ '--brand-mask': `url("${imageSource(source, 48 * scale, 48 * scale)}")` });
const FOOTER_LOGOS = [
  ...socialChannels.map(channel => ({ ...channel, node: <SocialIcon platform={channel.id} /> })),
  { ...telegramChannel, node: <SocialIcon platform={telegramChannel.id} /> },
  { node: <span className="home-footer-brand-mark home-footer-club-mark" style={footerMask('/lingyi-logo.jpg', 2.1)} />, title: '日新社', href: 'https://club.01aiedu.com/' },
  { node: <SiGithub />, title: 'GitHub' },
  { node: <SiX />, title: 'X', href: 'https://x.com/01yang2026?s=11' },
  { node: <span className="home-footer-brand-mark home-footer-feishu-mark" style={footerMask('/images/feishu-logo.png')} />, title: '飞书', href: LEARNING_WIKI_URL },
  { node: <span className="home-footer-brand-mark home-footer-lingyiyang-mark" style={footerMask('/images/lingyiyang-logo.jpg', 1.6)} />, title: '零一扬', href: 'https://www.01yang.space' },
  { node: <SiQq />, title: 'QQ', href: 'https://qun.qq.com/universal-share/share?ac=1&authKey=Y6PHDoQm%2BSNy%2Bdr0SJTyHZ7Vt2jQfwQCR6sidHUatABcMNltCtupL24cigSRxTYc&busi_data=eyJncm91cENvZGUiOiI5NjY2NTQ2MzMiLCJ0b2tlbiI6IllLUmVXNXM4WS8zMG1MRHlGeFFkUUd4M0R1ZG8wekpXMVB1a0N2dkhubVp6KzF5b2xOVjRKakxFZHQ4Q3dCRFQiLCJ1aW4iOiIxNzg1ODY3NzkyIn0%3D&data=-Yz2JZMQgTAM5BkEf9Vrw9lDLH6BkX2nFl4-tH8ska8WC6OQPqpmTcvM5f24z7x5jSg--p3b18JBNtQeMn3Tzg&svctype=4&tempid=h5_group_info' },
];
export default function App() {
  const { theme } = useTheme();
  const buttonProps = {
    ...SPECULAR_BUTTON_PROPS,
    textColor: theme === 'light' ? '#202024' : '#f5f5f5',
    lineColor: theme === 'light' ? '#000000' : '#ffffff',
    baseColor: theme === 'light' ? '#8e8e93' : '#525252',
    intensity: theme === 'light' ? 2.625 : SPECULAR_BUTTON_PROPS.intensity,
  };
  const borderGlowProps = BORDER_GLOW_PROPS;
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
    if (!href || href === '#' || !document.getElementById(decodeURIComponent(href.slice(1)))) return;
    event.preventDefault();
    scrollToSection(decodeURIComponent(href.slice(1)));
  }, [scrollToSection]);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const motion = gsap.matchMedia();
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const joinChannels = Array.from(root.querySelectorAll('.home-join-channel'));
        const joinRows = new Map();
        joinChannels.forEach(channel => {
          const row = channel.offsetTop;
          const order = joinRows.get(row) || 0;
          joinRows.set(row, order + 1);
          channel.dataset.entrance = 'pending';
          channel.style.setProperty('--join-entrance-delay', `${order * 550}ms`);
          ScrollTrigger.create({
            trigger: channel, start: 'top 88%', once: true,
            onEnter: () => { channel.dataset.entrance = 'visible'; },
          });
        });

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
            '.home-about-block',
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
            '.home-explore-bento',
            { opacity: 0.45 },
            { opacity: 1, duration: 0.56, ease: 'power4.out', clearProps: 'opacity' },
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
            '.home-footer-logo-loop',
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

        return () => joinChannels.forEach(channel => {
          delete channel.dataset.entrance;
          channel.style.removeProperty('--join-entrance-delay');
        });
      }, root);
      return () => context.revert();
    });

    ScrollTrigger.refresh();
    // Restore fragment targets after React mounts their corresponding sections.
    const restoreFragment = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const top = id === 'hero-title' || id === 'top' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - 88);
      window.scrollTo({ top, behavior: 'auto' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    let fragmentFrame = requestAnimationFrame(() => {
      fragmentFrame = requestAnimationFrame(restoreFragment);
    });
    window.addEventListener('load', restoreFragment, { once: true });
    window.addEventListener('hashchange', restoreFragment);
    const cancelScroll = () => scrollTweenRef.current?.kill();
    const onScrollKey = event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelScroll();
    };
    window.addEventListener('wheel', cancelScroll, { passive: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true });
    window.addEventListener('keydown', onScrollKey);
    return () => {
      scrollTweenRef.current?.kill();
      cancelAnimationFrame(fragmentFrame);
      window.removeEventListener('load', restoreFragment);
      window.removeEventListener('hashchange', restoreFragment);
      window.removeEventListener('wheel', cancelScroll);
      window.removeEventListener('touchstart', cancelScroll);
      window.removeEventListener('keydown', onScrollKey);
      motion.revert();
    };
  }, []);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const english = root?.querySelector('.slogan-english');
    const text = english?.querySelector('.echo-text');
    if (!english || !text) return undefined;

    // Preserve the smaller English type size and echo effect, fitting the
    // sentence onto one line when space is limited.
    const fitEnglish = () => {
      const baseSize = parseFloat(getComputedStyle(text).fontSize) || 1;
      const maximum = parseFloat(getComputedStyle(english).fontSize) / baseSize;
      const scale = Math.min(maximum, english.clientWidth * 0.97 / Math.max(text.offsetWidth, 1));
      english.style.setProperty('--echo-scale', String(scale));
      const height = `${Math.ceil(text.offsetHeight * scale) + 8}px`;
      if (english.style.height !== height) english.style.height = height;
    };
    const observer = new ResizeObserver(fitEnglish);
    observer.observe(root.querySelector('.hero-stage'));
    observer.observe(text);
    fitEnglish();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef} className="homepage" id="top" onClickCapture={handleInternalLinkClick}>
      <a className="skip-link" href="#introduction">跳到主要内容</a>

      <SiteBackground />

      <SiteNavigation />

      <main className="hero" aria-labelledby="hero-title">
        <div id="introduction" className="hero-stage" style={{ width: '100%', height: '100dvh', position: 'relative' }}>
          <PerspectiveTunnelHero>
            <div className="hero-content">
              <p className="release-pill">
                <b>01</b>
                <span>AI CLUB</span>
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
              <p className="echo-viewport slogan-echo slogan-english" lang="en">
                <span className="echo-scale">
                  <EchoText {...ECHO_TEXT_PROPS} text={SLOGAN_EN} />
                </span>
              </p>

              <div className="hero-lower">
                <div className="hero-meta-row">
                  <a className="hero-license-link" href="#about">成立于 · 2026.09.01</a>
                </div>

                <div className="hero-proof">
                  <p className="hero-proof-meta">
                    学习新范式 · 开源共建 · 公益教学 · 实践探索
                  </p>
                </div>

                <div className="hero-actions">
                  <SpecularButton
                    {...buttonProps}
                    className="hero-button"
                    onClick={() => scrollToSection('about')}
                  >
                    关于我们
                  </SpecularButton>
                  <SpecularButton
                    {...buttonProps}
                    className="hero-button"
                    onClick={() => scrollToSection('directions')}
                  >
                    我们在做什么
                  </SpecularButton>
                  <SpecularButton
                    {...buttonProps}
                    className="hero-button"
                    onClick={() => scrollToSection('join')}
                  >
                    加入我们
                  </SpecularButton>
                </div>
              </div>
            </div>
          </PerspectiveTunnelHero>
        </div>

        <div className="home-sections">
          <section className="home-section home-trust-section" id="about" aria-labelledby="about-title">
            <h2 className="home-flow-title" id="about-title" tabIndex="-1">
              关于我们
            </h2>

            <BorderGlow {...borderGlowProps} className="home-trust-glow">
              <div className="home-trust-panel">
                <div className="home-trust-intro">
                  <h3 className="home-trust-subtitle">{SLOGAN}</h3>

                  <div className="home-about-block">
                    <p className="home-about-lead"><strong>这里是「零一 AI 日新社｜01 AI Club」！</strong></p>
                    <blockquote className="home-about-quote">
                      <p>一个面向 AI 探索者、向全社会开放的交流社区、共创社团与开源知识库。</p>
                      <p>「零一 AI 日新社」成立于 2026 年 9 月 1 日，我是社长，零一扬！</p>
                    </blockquote>
                  </div>

                  <div className="home-about-block">
                    <p className="home-about-lead"><strong>我们成立社团的初心，是探索一种能在真实世界中落地的“大学｜学习新范式”！</strong></p>
                    <blockquote className="home-about-quote">
                      <p>
                        我们不把绩点和考试视为大学成长的全部，而是选择在实践中不断成长，不断进步。<br />
                        我们以 公益教学 为核心，希望帮助每一位真正想学习 AI 的同学找到起点，<br />
                        在交流与实践中迈出第一步，完成属于自己的从零到一！
                      </p>
                    </blockquote>
                  </div>

                </div>
              </div>
            </BorderGlow>
          </section>

          <ExploreSection buttonProps={buttonProps} borderGlowProps={borderGlowProps} knowledgeUrl={LEARNING_WIKI_URL} />

          <section className="home-section home-business-section" id="business" aria-labelledby="business-title" tabIndex="-1">
            <h2 className="home-flow-title" id="business-title">零一商业</h2>
            <div className="home-business-intro">
              <h3 className="home-business-lead">用 AI 解决真实问题，让技术创造社会价值。</h3>
              <p>我们是福州零一极致智能科技有限公司！</p>
            </div>
            <ViewportMount className="home-business-carousel" minHeight={640}>
              <Suspense fallback={null}>
              <FlexCarousel
                items={businesses}
                preset="liquid"
                intro="rise"
                cardHeight={0.5}
                gap={12}
                radius={20}
                squeeze={0.2}
                focusOnClick
                captions
                captionCredit="零一 AI 日新社"
                captureWheel
                websiteButtonProps={buttonProps}
              />
              </Suspense>
            </ViewportMount>
          </section>

          <ResearchSection buttonProps={buttonProps} />

          <section className="home-section home-cooperation-section home-partners-section" id="partners" aria-labelledby="partners-title" tabIndex="-1">
            <div className="home-partners-heading">
              <h2 className="home-flow-title" id="partners-title">零一合作生态</h2>
              <div className="home-cooperation-actions">
                <SpecularButton {...buttonProps} href="https://scn96l2kzmbn.feishu.cn/wiki/X7h6wI8SCiAuZAkpYF2caNv7nTG" target="_blank" rel="noopener noreferrer" className="home-cooperation-link">
                  关于合作生态 <span aria-hidden="true">↗</span>
                </SpecularButton>
              </div>
            </div>
            <ViewportMount minHeight={96}><LogoMarquee /></ViewportMount>
          </section>

          <section className="home-section home-cooperation-section" id="cooperation" aria-labelledby="cooperation-title" tabIndex="-1">
            <h2 className="home-flow-title" id="cooperation-title">零一高校分社</h2>
            <p className="home-cooperation-intro">团结一切可以团结的力量！</p>
            <BranchAtlas buttonProps={buttonProps} borderGlowProps={borderGlowProps} />
          </section>

          <section className="home-note" id="join" aria-labelledby="join-title" tabIndex="-1">
            <h2 className="home-flow-title" id="join-title">欢迎加入零一 AI 日新社</h2>
            <p className="home-join-slogan"><strong>从零到一，让技术进步成为每个人的机会！</strong></p>
            <p className="home-join-slogan home-join-slogan-en" lang="en"><strong>{SLOGAN_EN}</strong></p>
            <div className="home-join-channels">
              <figure className="home-join-channel">
                <BorderGlow {...borderGlowProps} className="home-join-qr-glow">
                  <div className="home-join-qr-media">
                    <ResponsiveImage
                      className="home-join-qr"
                      src={joinQr}
                      alt="零一 AI 日新社 QQ 群二维码"
                      width="640"
                      height="640"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </BorderGlow>
                <figcaption>零一 QQ 社团群</figcaption>
              </figure>
              <figure className="home-join-channel">
                <BorderGlow {...borderGlowProps} className="home-join-qr-glow">
                  <div className="home-join-qr-media home-join-official-qr">
                    <ResponsiveImage
                      className="home-join-qr home-join-qr--wechat"
                      src={wechatChannel.qr}
                      alt="零一 AI 日新社微信公众号二维码"
                      width="430"
                      height="430"
                      loading="lazy"
                      decoding="async"
                    />
                    <ResponsiveImage
                      className="home-join-qr home-join-official-logo"
                      src={wechatChannel.qr}
                      alt=""
                      aria-hidden="true"
                      width="430"
                      height="430"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </BorderGlow>
                <figcaption>「零一 AI 日新社」公众号</figcaption>
              </figure>
              <figure className="home-join-channel" id="join-contact">
                <BorderGlow {...borderGlowProps} className="home-join-qr-glow">
                  <div className="home-join-qr-media home-join-personal-qr">
                    <ResponsiveImage
                      className="home-join-qr home-join-qr--wechat"
                      src="/images/join-lingyiyang-wechat.jpg"
                      alt="商务合作联系零一扬的微信二维码"
                      width="888"
                      height="1131"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </BorderGlow>
                <figcaption>商务合作联系：零一扬</figcaption>
              </figure>
            </div>
          </section>
        </div>
      </main>

      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <strong>零一 AI 日新社｜01 AI Club</strong>
            <p>
              {SLOGAN}<br />
              <span className="home-footer-english" lang="en">{SLOGAN_EN}</span>
            </p>
          </div>
          <ViewportMount className="home-footer-logo-loop" minHeight={64}>
          <LogoLoop
            logos={FOOTER_LOGOS}
            speed={90}
            direction="left"
            logoHeight={48}
            gap={40}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#0d0d0d"
            ariaLabel="社团与社交平台"
          />
          </ViewportMount>
        </div>

        <ShutterWordmark />
        <div className="home-footer-copyright">
          <span>版权所有 © 2026 零一 AI 日新社</span>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
            地图数据 © OpenStreetMap 贡献者
          </a>
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
