import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { useApp } from '../contexts/AppContext.jsx';
import { HW, Mono, SB, Dot, StateDot, Prio, Btn, Check, Ic } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';
import { todayISO, formatDue } from '../utils/dates.js';

export default function DashboardPage() {
  const { tasks, projects, navigate, setOpenTaskId, openCreateTask, selectedProject } = useApp();

  const baseTasks = selectedProject ? tasks.filter((t) => t.project === selectedProject) : tasks;
  const selectedProj = selectedProject ? projects.find((p) => p.id === selectedProject) : null;

  const iso = todayISO();
  const today = baseTasks.filter((t) => t.due === iso);
  const inExec = baseTasks.filter((t) => t.status === 'exec');
  const inWait = baseTasks.filter((t) => t.status === 'wait');
  const done = baseTasks.filter((t) => t.status === 'done');
  const upcoming = baseTasks.filter((t) => t.status !== 'done' && t.due !== '—' && t.due > iso).slice(0, 6);

  const stats = [
    { label: 'Tareas hoy', value: today.length, sub: `${today.filter(t => t.status === 'done').length} completadas`, color: 'var(--wf-accent)' },
    { label: 'En ejecución', value: inExec.length, sub: 'en progreso', color: wfTokens.hueExec },
    { label: 'En espera', value: inWait.length, sub: 'bloqueadas', color: wfTokens.hueWait },
    { label: 'Completadas', value: done.length, sub: 'en total', color: wfTokens.hueDone },
  ];

  const activeProjects = projects.filter((p) => p.status === 'activo');

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle sub={selectedProj ? `Proyecto: ${selectedProj.name}` : 'jueves · 28 mayo 2026'} right={
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn ghost onClick={() => navigate('board')}><Ic d={I.grid} size={10} /> Tablero</Btn>
          <Btn primary onClick={() => openCreateTask()}>
            <Ic d={I.plus} size={10} /> Nueva tarea
          </Btn>
        </div>
      }>Inicio</PageTitle>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map(({ label, value, sub, color }) => (
            <SB key={label} style={{ padding: 16, borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 32, fontFamily: '"Caveat", cursive', color: wfTokens.text, lineHeight: 1 }}>{value}</div>
              <div style={{ marginTop: 6, fontSize: 11, color: wfTokens.text, fontWeight: 500 }}>{label}</div>
              <Mono size={9} style={{ marginTop: 2 }}>{sub}</Mono>
            </SB>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, minHeight: 0 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Today's tasks */}
            <SB style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HW size={18}>Para hoy</HW>
                <Mono>· {today.length} tareas</Mono>
                <div style={{ flex: 1 }} />
                <button onClick={() => navigate('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Mono size={9} style={{ color: 'var(--wf-accent)', textDecoration: 'underline' }}>ver todas</Mono>
                </button>
                <button onClick={() => openCreateTask({ due: iso })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <Ic d={I.plus} size={11} />
                </button>
              </div>
              {today.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <Mono size={10}>No hay tareas para hoy 🎉</Mono>
                </div>
              )}
              {today.map((task, i) => (
                <div key={task.id} onClick={() => setOpenTaskId(task.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  borderBottom: i < today.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
                  cursor: 'pointer',
                }}>
                  <Check done={task.status === 'done'} size={13} />
                  <StateDot k={task.status} size={7} />
                  <span style={{ flex: 1, fontSize: 12, color: task.status === 'done' ? wfTokens.textDim : wfTokens.text, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                  <Prio level={task.priority} />
                  <Mono size={9}>{formatDue(task.due)}</Mono>
                </div>
              ))}
            </SB>

            {/* Upcoming */}
            <SB style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HW size={18}>Próximas</HW>
                <Mono>· esta semana y más</Mono>
              </div>
              {upcoming.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <Mono size={10}>Sin tareas próximas</Mono>
                </div>
              )}
              {upcoming.map((task, i) => (
                <div key={task.id} onClick={() => setOpenTaskId(task.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px',
                  borderBottom: i < upcoming.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
                  cursor: 'pointer',
                }}>
                  <StateDot k={task.status} size={6} />
                  <span style={{ flex: 1, fontSize: 11, color: wfTokens.text }}>{task.title}</span>
                  <Mono size={9} style={{ flexShrink: 0 }}>{formatDue(task.due)}</Mono>
                  {task.priority !== 'low' && <Prio level={task.priority} />}
                </div>
              ))}
            </SB>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Projects */}
            <SB style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center' }}>
                <HW size={18}>Proyectos activos</HW>
                <div style={{ flex: 1 }} />
                <button onClick={() => navigate('projects')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Mono size={9} style={{ color: 'var(--wf-accent)', textDecoration: 'underline' }}>ver todos</Mono>
                </button>
              </div>
              {activeProjects.map((proj) => {
                const projTasks = tasks.filter((t) => t.project === proj.id);
                const projDone = projTasks.filter((t) => t.status === 'done').length;
                const projTotal = projTasks.length;
                return (
                  <div key={proj.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Dot c={proj.color} size={7} />
                      <span style={{ flex: 1, fontSize: 11, color: wfTokens.text, fontWeight: 500 }}>{proj.name}</span>
                      <Mono>{projDone}/{projTotal}</Mono>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${projTotal ? (projDone / projTotal) * 100 : 0}%`, background: proj.color, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
              {activeProjects.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <Mono size={10}>Sin proyectos activos</Mono>
                </div>
              )}
            </SB>

            {/* State summary */}
            <SB style={{ padding: 14 }}>
              <HW size={16} style={{ display: 'block', marginBottom: 12 }}>Por estado</HW>
              {['new', 'wait', 'exec', 'done'].map((k) => {
                const count = baseTasks.filter((t) => t.status === k).length;
                const pct = baseTasks.length ? Math.round((count / baseTasks.length) * 100) : 0;
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <StateDot k={k} size={6} />
                    <Mono size={9} style={{ width: 75, color: wfTokens.textMuted }}>
                      {({ new: 'Nueva', wait: 'Espera', exec: 'Ejecución', done: 'Finalizada' })[k]}
                    </Mono>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: stateColor(k), borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <Mono size={9} style={{ width: 16, textAlign: 'right' }}>{count}</Mono>
                  </div>
                );
              })}
            </SB>
          </div>
        </div>
      </div>
    </div>
  );
}
