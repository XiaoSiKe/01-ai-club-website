import { useLanguage } from './Language';
import { useEffect } from 'react';
import SiteNavigation from './components/SiteNavigation';
import SpecularButton from './SpecularButton';
import { researchThemes, researchUrl } from './data/research';
import './ResearchPage.css';

export default function ResearchPage() {
  const { t } = useLanguage();
  useEffect(() => {
    const prior = document.title;
    document.title = t('零一科研 · 01 AI CLUB');
    return () => { document.title = prior; };
  }, [t]);
  return <main className="research-page">
    <SiteNavigation standalone />
    <div className="research-page__content">
      <a className="research-page__back" href="./#research">{t("← 返回零一科研")}</a>
      <header><h1>{t("零一科研")}</h1><p>{t("从一个问题出发，向未知再走一步。")}</p></header>
      <div className="research-page__directions">{researchThemes.map(item => <section key={item.title}>
        <span>{t(item.verb)}</span><div><h2>{t(item.title)}</h2><p>{t(item.text)}</p></div>
      </section>)}</div>
      <SpecularButton size="md"
        href={researchUrl} target="_blank" rel="noopener noreferrer">{t("打开科研专栏 ")}<span aria-hidden="true">↗</span></SpecularButton>
    </div>
  </main>;
}
