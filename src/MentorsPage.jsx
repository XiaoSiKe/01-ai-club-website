import { useEffect } from 'react';
import SiteNavigation from './components/SiteNavigation';
import TeamShowcase from './components/TeamShowcase';
import BrandTitle from './components/BrandTitle';
import { mentors } from './data/mentors';
import './MentorsPage.css';

export default function MentorsPage() {
  useEffect(() => {
    const title = document.title;
    document.title = 'Mentor · 零一 AI 日新社';
    return () => { document.title = title; };
  }, []);

  return <main className="mentors-page">
    <SiteNavigation standalone />
    <div className="mentors-page__content">
      <TeamShowcase members={mentors} headingAs="h1" headingContent={<BrandTitle text="Mentor" />} />
    </div>
  </main>;
}
