import { useEffect } from 'react';
import SiteNavigation from './components/SiteNavigation';
import SpecularButton from './SpecularButton';
import { researchThemes, researchUrl } from './data/research';
import './ResearchPage.css';

export default function ResearchPage() {
  useEffect(() => {
    const prior = document.title;
    document.title = '零一科研 · 01 AI CLUB';
    return () => { document.title = prior; };
  }, []);
  return <main className="research-page">
    <SiteNavigation standalone />
    <div className="research-page__content">
      <a className="research-page__back" href="./#research">← 返回零一科研</a>
      <header><h1>零一科研</h1><p>从一个问题出发，向未知再走一步。</p></header>
      <div className="research-page__directions">{researchThemes.map(item => <section key={item.title}>
        <span>{item.verb}</span><div><h2>{item.title}</h2><p>{item.text}</p></div>
      </section>)}</div>
      <SpecularButton size="md"
        href={researchUrl} target="_blank" rel="noopener noreferrer">打开科研专栏 <span aria-hidden="true">↗</span></SpecularButton>
    </div>
  </main>;
}
