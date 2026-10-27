import { useEffect } from 'react';
import SiteNavigation from './components/SiteNavigation';
import TeamShowcase from './components/TeamShowcase';
import BrandTitle from './components/BrandTitle';
import SiteBackground from './components/SiteBackground';
import { mentors } from './data/mentors';
import './MentorsPage.css';

export default function MentorsPage() {
  useEffect(() => {
    const title = document.title;
    document.title = '启航导师 · 零一 AI 日新社';
    return () => { document.title = title; };
  }, []);

  return <main className="mentors-page">
    <SiteBackground />
    <SiteNavigation standalone />
    <div className="mentors-page__content">
      <TeamShowcase members={mentors} headingAs="h1" headingContent={<>
        <span className="mentors-page__eyebrow"><BrandTitle text="零一 AI 日新社｜Mentor" /></span>
        <span className="mentors-page__headline"><BrandTitle text="启航" /><BrandTitle text="导师" /></span>
      </>} />
    </div>
  </main>;
}
