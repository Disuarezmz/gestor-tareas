import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

async function api(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function AppProvider({ children }) {
  const [page, setPage] = useState('board');
  const [selectedProject, setSelectedProject] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [createTaskDefaults, setCreateTaskDefaults] = useState({});
  const [showSearch, setShowSearch] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load on mount ───────────────────────────────────────────
  useEffect(() => {
    Promise.all([api('/projects'), api('/tasks')])
      .then(([projs, tsks]) => { setProjects(projs); setTasks(tsks); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Task actions ────────────────────────────────────────────
  const createTask = useCallback(async (data) => {
    const task = await api('/tasks', { method: 'POST', body: JSON.stringify(data) });
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id, changes) => {
    // Optimistic update for instant UI feedback
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    await api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
  }, []);

  const deleteTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setOpenTaskId((v) => (v === id ? null : v));
    await api(`/tasks/${id}`, { method: 'DELETE' });
  }, []);

  // ── Project actions ─────────────────────────────────────────
  const createProject = useCallback(async (data) => {
    const proj = await api('/projects', { method: 'POST', body: JSON.stringify(data) });
    setProjects((prev) => [...prev, proj]);
    return proj;
  }, []);

  const updateProject = useCallback(async (id, changes) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
    await api(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
  }, []);

  const deleteProject = useCallback(async (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSelectedProject((v) => (v === id ? null : v));
    await api(`/projects/${id}`, { method: 'DELETE' });
  }, []);

  // ── Open create modal with defaults ────────────────────────
  const openCreateTask = useCallback((defaults = {}) => {
    setCreateTaskDefaults(defaults);
    setShowCreateTask(true);
  }, []);

  return (
    <AppCtx.Provider value={{
      page, navigate: setPage,
      selectedProject, setSelectedProject,
      openTaskId, setOpenTaskId,
      showCreateTask, setShowCreateTask,
      showCreateProject, setShowCreateProject,
      showSearch, setShowSearch,
      createTaskDefaults, openCreateTask,
      tasks, projects,
      loading, error,
      createTask, updateTask, deleteTask,
      createProject, updateProject, deleteProject,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
