import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { WFTheme } from './contexts/ThemeContext.jsx';
import { wfTokens } from './constants/tokens.js';
import { Page } from './components/primitives/index.jsx';
import { TopBar, Sidebar } from './components/chrome/index.jsx';
import TaskDetailPanel from './components/TaskDetailPanel.jsx';
import CreateTaskModal from './components/modals/CreateTaskModal.jsx';
import CreateProjectModal from './components/modals/CreateProjectModal.jsx';
import SearchBar from './components/SearchBar.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import BoardPage from './pages/BoardPage.jsx';
import ListView from './pages/ListView.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const THEME = {
  accent: 'oklch(75% 0.13 210)',
  states: { new: 'Nueva', wait: 'En espera', exec: 'En ejecución', done: 'Finalizada' },
  sidebar: true,
};

const PAGES = {
  dashboard: DashboardPage,
  board: BoardPage,
  list: ListView,
  calendar: CalendarPage,
  projects: ProjectsPage,
  settings: SettingsPage,
};

function AppShell() {
  const { page, openTaskId, showCreateTask, showCreateProject, showSearch, setShowSearch, openCreateTask, loading, error } = useApp();
  const ActivePage = PAGES[page] ?? BoardPage;

  // Global Cmd+K / Ctrl+K shortcut
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openCreateTask();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setShowSearch, openCreateTask]);

  if (loading) return (
    <Page style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, var(--wf-accent), ${wfTokens.surface})`, opacity: 0.8 }} />
      <span style={{ fontSize: 11, color: wfTokens.textDim, fontFamily: '"JetBrains Mono", monospace' }}>conectando…</span>
    </Page>
  );

  if (error) return (
    <Page style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: wfTokens.hueHigh, fontFamily: '"JetBrains Mono", monospace' }}>
        Error de conexión: {error}
      </span>
      <span style={{ fontSize: 10, color: wfTokens.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
        ¿Está arrancado el servidor? npm run dev:server
      </span>
    </Page>
  );

  return (
    <Page>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ActivePage />
        </main>
        {openTaskId && <TaskDetailPanel />}
      </div>

      {showCreateTask && <CreateTaskModal />}
      {showCreateProject && <CreateProjectModal />}
      {showSearch && <SearchBar />}
    </Page>
  );
}

export default function App() {
  React.useEffect(() => {
    document.documentElement.style.setProperty('--wf-accent', THEME.accent);
  }, []);

  return (
    <AppProvider>
      <WFTheme.Provider value={THEME}>
        <AppShell />
      </WFTheme.Provider>
    </AppProvider>
  );
}
