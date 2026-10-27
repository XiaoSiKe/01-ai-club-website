import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Theme';
import { PageLoading } from './components/UniqueLoading';
import './styles.css';
import './theme.css';

const ProjectPage = lazy(() => import('./ProjectPage'));
const App = lazy(() => import('./App'));
const PioneersPage = lazy(() => import('./PioneersPage'));
const MentorsPage = lazy(() => import('./MentorsPage'));
const ResearchPage = lazy(() => import('./ResearchPage'));
const ArchitecturePage = lazy(() => import('./ArchitecturePage'));
const pageId = new URLSearchParams(window.location.search).get('page');
const projectId = new URLSearchParams(window.location.search).get('project');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      {pageId === 'architecture' ? (
        <Suspense fallback={<PageLoading />}>
          <ArchitecturePage />
        </Suspense>
      ) : pageId === 'research' ? (
        <Suspense fallback={<PageLoading />}>
          <ResearchPage />
        </Suspense>
      ) : pageId === 'mentors' ? (
        <Suspense fallback={<PageLoading />}>
          <MentorsPage />
        </Suspense>
      ) : pageId === 'pioneers' ? (
        <Suspense fallback={<PageLoading />}>
          <PioneersPage />
        </Suspense>
      ) : projectId !== null ? (
        <Suspense fallback={<PageLoading />}>
          <ProjectPage projectId={projectId} />
        </Suspense>
      ) : <Suspense fallback={<PageLoading />}><App /></Suspense>}
    </ThemeProvider>
  </StrictMode>,
);
