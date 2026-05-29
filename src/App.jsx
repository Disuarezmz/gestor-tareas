import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { WFTheme } from './contexts/ThemeContext.jsx';
import { wfTokens } from './constants/tokens.js';
import { Page } from './components/primitives/index.jsx';
import { TopBar, Sidebar } from './components/chrome/index.jsx';
import TaskDetailPanel from './components/TaskDetailPanel.jsx';
import CreateTaskModal from './components/modals/CreateTaskModal.jsx';
import CreateProjectModal from './components/modals/CreateProjectModal.jsx';
import SearchBar from './components/SearchBar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ForceChangePasswordPage from './pages/ForceChangePasswordPage.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import BoardPage from './pages/BoardPage.jsx';
import ListView from './pages/ListView.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

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
  teams: GroupsPage,
  settings: SettingsPage,
  admin: AdminPage,
};

function AppShell() {
  const { page, openTaskId, showCreateTask, showCreateProject, showSearch, setShowSearch, openCreateTask, loading, error, sidebarOpen, setSidebarOpen } = useApp();
  const ActivePage = PAGES[page] ?? BoardPage;

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
    <Page style={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="wf-spinner"
          style={{
            position: 'absolute', inset: 0,
            border: `2px solid ${wfTokens.border}`,
            borderTopColor: 'var(--wf-accent)',
            borderRadius: '50%',
          }}
        />
        <div
          className="wf-loading-pulse"
          style={{ width: 14, height: 14, borderRadius: 3, background: `linear-gradient(135deg, var(--wf-accent), color-mix(in oklch, var(--wf-accent) 40%, ${wfTokens.bg}))` }}
        />
      </div>
      <span style={{ fontSize: 11, color: wfTokens.textDim, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.5 }}>conectando…</span>
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
        {sidebarOpen && (
          <div
            className="wf-backdrop"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)' }}
          />
        )}
        <Sidebar />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div key={page} className="wf-page-fade" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ActivePage />
          </div>
        </main>
        {openTaskId && <TaskDetailPanel />}
      </div>

      {showCreateTask && <CreateTaskModal />}
      {showCreateProject && <CreateProjectModal />}
      {showSearch && <SearchBar />}
    </Page>
  );
}

function Root() {
  const { user, authLoading } = useAuth();

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: wfTokens.bg, flexDirection: 'column', gap: 14 }}>
      <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="wf-spinner"
          style={{
            position: 'absolute', inset: 0,
            border: `2px solid ${wfTokens.border}`,
            borderTopColor: 'var(--wf-accent)',
            borderRadius: '50%',
          }}
        />
        <div
          className="wf-loading-pulse"
          style={{ width: 14, height: 14, borderRadius: 3, background: `linear-gradient(135deg, var(--wf-accent), color-mix(in oklch, var(--wf-accent) 40%, ${wfTokens.bg}))` }}
        />
      </div>
      <span style={{ fontSize: 11, color: wfTokens.textDim, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.5 }}>cargando…</span>
    </div>
  );

  if (!user) return <AuthPage />;
  if (user.mustChangePassword) return <ForceChangePasswordPage />;

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default function App() {
  React.useEffect(() => {
    document.documentElement.style.setProperty('--wf-accent', THEME.accent);
  }, []);

  return (
    <AuthProvider>
      <WFTheme.Provider value={THEME}>
        <Root />
      </WFTheme.Provider>
    </AuthProvider>
  );
}
