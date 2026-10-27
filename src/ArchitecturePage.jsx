import { useEffect, useState } from 'react';
import SiteNavigation from './components/SiteNavigation';
import SiteBackground from './components/SiteBackground';
import BrandTitle from './components/BrandTitle';
import { architectureRoles, architectureSystems, architectureWorkflow } from './data/architecture';
import './ArchitecturePage.css';

const managementSystems = architectureSystems.filter(system => system.type === 'management');
const businessSystems = architectureSystems.filter(system => system.type === 'business');

export default function ArchitecturePage() {
  const [selectedId, setSelectedId] = useState('coordination');
  const selected = architectureSystems.find(system => system.id === selectedId);

  useEffect(() => {
    const title = document.title;
    document.title = '零一系统架构 · 零一 AI 日新社';
    return () => { document.title = title; };
  }, []);

  const systemCard = system => <button
    key={system.id}
    type="button"
    className={`architecture-system-card${selectedId === system.id ? ' is-selected' : ''}`}
    aria-label={`查看${system.title}职责`}
    aria-pressed={selectedId === system.id}
    aria-controls="architecture-system-detail"
    onClick={() => setSelectedId(system.id)}
  >{system.type === 'business' ? system.title.replace(/系统$/, '') : system.title}</button>;

  return <main className="architecture-page">
    <SiteBackground />
    <SiteNavigation standalone />
    <a className="skip-link" href="#architecture-map">跳到社团系统</a>
    <div className="architecture-page__content">
      <section className="architecture-section" id="architecture-map" aria-labelledby="architecture-map-title">
        <header className="architecture-section-heading">
          <h1 className="architecture-title" id="architecture-map-title" aria-label="社团系统">
            <BrandTitle text="社团" /><BrandTitle text="系统" />
          </h1>
          <p>两个管理系统 · 七个业务系统</p>
        </header>
        <div className="architecture-map" role="group" aria-label="点选系统查看职责">
          <div className="architecture-management">
            {managementSystems.map(system => <div className="architecture-management-step" key={system.id}>
              {systemCard(system)}
              <span className="architecture-connector" aria-hidden="true">↓</span>
            </div>)}
          </div>
          <p className="architecture-business-label">业务系统 · 同级协作</p>
          <div className="architecture-business-grid">{businessSystems.map(systemCard)}</div>
        </div>
        <section className="architecture-system-detail" id="architecture-system-detail" aria-labelledby="architecture-detail-title" aria-live="polite" aria-atomic="true">
          <h3 id="architecture-detail-title">{selected.title}</h3>
          <p>{selected.summary}</p>
        </section>
      </section>

      <section className="architecture-section" id="architecture-organization" aria-labelledby="architecture-organization-title">
        <h2 className="architecture-title" id="architecture-organization-title" aria-label="组织架构">
          <BrandTitle text="组织" /><BrandTitle text="架构" />
        </h2>
        <dl className="architecture-roles">
          {architectureRoles.map(role => <div key={role.title}>
            <dt>{role.href ? <a href={role.href}>{role.title}<span aria-hidden="true"> ↗</span></a> : role.title}</dt>
            <dd>{role.summary}</dd>
          </div>)}
        </dl>
        <section className="architecture-process" id="architecture-workflow" aria-labelledby="architecture-workflow-title">
          <h3 id="architecture-workflow-title">协作流程</h3>
          <ol className="architecture-workflow">
            {architectureWorkflow.map(step => <li key={step}>{step}</li>)}
          </ol>
          <p>飞书多维表格统一管理任务、进度与成果</p>
        </section>
      </section>

    </div>
  </main>;
}
