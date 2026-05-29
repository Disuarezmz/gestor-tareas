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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState({});
  const [projectMembers, setProjectMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load on mount ───────────────────────────────────────────
  useEffect(() => {
    Promise.all([api('/projects'), api('/tasks'), api('/groups')])
      .then(([projs, tsks, grps]) => { setProjects(projs); setTasks(tsks); setGroups(grps); })
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
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    const updated = await api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
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

  // ── Project members ─────────────────────────────────────────
  const loadProjectMembers = useCallback(async (projectId) => {
    const members = await api(`/projects/${projectId}/members`);
    setProjectMembers((prev) => ({ ...prev, [projectId]: members }));
    return members;
  }, []);

  const addProjectMember = useCallback(async (projectId, data) => {
    const result = await api(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(data) });
    await loadProjectMembers(projectId);
    return result;
  }, [loadProjectMembers]);

  const updateProjectMember = useCallback(async (projectId, userId, role) => {
    await api(`/projects/${projectId}/members/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) });
    setProjectMembers((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((m) => (m.id === userId ? { ...m, role } : m)),
    }));
  }, []);

  const removeProjectMember = useCallback(async (projectId, userId) => {
    await api(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
    setProjectMembers((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter((m) => m.id !== userId),
    }));
  }, []);

  // ── Group actions ───────────────────────────────────────────
  const createGroup = useCallback(async (data) => {
    const group = await api('/groups', { method: 'POST', body: JSON.stringify(data) });
    setGroups((prev) => [...prev, group]);
    return group;
  }, []);

  const updateGroup = useCallback(async (id, changes) => {
    const updated = await api(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(changes) });
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  }, []);

  const deleteGroup = useCallback(async (id) => {
    await api(`/groups/${id}`, { method: 'DELETE' });
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setGroupMembers((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }, []);

  const loadGroupMembers = useCallback(async (groupId) => {
    const members = await api(`/groups/${groupId}/members`);
    setGroupMembers((prev) => ({ ...prev, [groupId]: members }));
    return members;
  }, []);

  const addGroupMember = useCallback(async (groupId, data) => {
    const member = await api(`/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify(data) });
    setGroupMembers((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []).filter((m) => m.id !== member.id), member],
    }));
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, memberCount: (g.memberCount || 1) + 1 } : g)));
    return member;
  }, []);

  const removeGroupMember = useCallback(async (groupId, userId) => {
    await api(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
    setGroupMembers((prev) => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter((m) => m.id !== userId),
    }));
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, memberCount: Math.max(0, (g.memberCount || 1) - 1) } : g)));
  }, []);

  // ── User search ─────────────────────────────────────────────
  const searchUsers = useCallback(async (q) => {
    return api(`/users?q=${encodeURIComponent(q)}`);
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
      sidebarOpen, setSidebarOpen,
      createTaskDefaults, openCreateTask,
      tasks, projects, groups,
      groupMembers, projectMembers,
      loading, error,
      createTask, updateTask, deleteTask,
      createProject, updateProject, deleteProject,
      loadProjectMembers, addProjectMember, updateProjectMember, removeProjectMember,
      createGroup, updateGroup, deleteGroup,
      loadGroupMembers, addGroupMember, removeGroupMember,
      searchUsers,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
