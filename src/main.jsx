import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Theme';
import StartupGate from './components/StartupGate';
import './styles.css';
import './theme.css';

const pageId = new URLSearchParams(window.location.search).get('page');
const projectId = new URLSearchParams(window.location.search).get('project');
const pages = {
  architecture: () => import('./ArchitecturePage'),
  research: () => import('./ResearchPage'),
  mentors: () => import('./MentorsPage'),
  pioneers: () => import('./PioneersPage'),
};
const homepage = !Object.hasOwn(pages, pageId) && projectId === null;
const loadPage = Object.hasOwn(pages, pageId) ? pages[pageId]
  : projectId !== null ? () => import('./ProjectPage') : () => import('./App');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <StartupGate loadPage={loadPage} homepage={homepage} projectId={projectId} />
    </ThemeProvider>
  </StrictMode>,
);
