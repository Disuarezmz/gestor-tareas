import { useState } from 'react';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { useApp } from '../contexts/AppContext.jsx';
import { HW, Mono, SB, Dot, StatePill, Prio, Tag, Btn, Check, Ic } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';
import { formatDue } from '../utils/dates.js';

const SORT_OPTIONS = [
  { value: 'due', label: 'Fecha ↑' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'status', label: 'Estado' },
  { value: 'title', label: 'Nombre' },
];

const PRIORITY_ORDER = { high: 0, med: 1, low: 2 };
const STATUS_ORDER   = { exec: 0, wait: 1, new: 2, done: 3 };

function sortTasks(tasks, by) {
  return [...tasks].sort((a, b) => {
    if (by === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (by === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (by === 'title') return a.title.localeCompare(b.title);
    // due: earliest first, — last
    const duePrio = (d) => (!d || d === '—') ? 'z' : d;
    return duePrio(a.due).localeCompare(duePrio(b.due));
  });
}

export default function ListView() {
  const { tasks, projects, selectedProject, setOpenTaskId, openCreateTask, updateTask } = useApp();
  const [sortBy, setSortBy] = useState('due');
  const [filterStatus, setFilterStatus] = useState('all');

  let filtered = selectedProject ? tasks.filter((t) => t.project === selectedProject) : tasks;
  if (filterStatus !== 'all') filtered = filtered.filter((t) => t.status === filterStatus);
  const sorted = sortTasks(filtered, sortBy);

  const proj = selectedProject ? projects.find((p) => p.id === selectedProject) : null;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle
        sub={proj ? `${proj.name} · ${filtered.length} tareas` : `todas las tareas · ${filtered.length} tareas`}
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 2 }}>
              {[['all', 'Todas'], ['new', 'Nueva'], ['wait', 'Espera'], ['exec', 'Ejecución'], ['done', 'Hecho']].map(([k, label]) => (
                <button key={k} onClick={() => setFilterStatus(k)} style={{
                  padding: '5px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 10,
                  fontFamily: 'inherit', border: `1px solid ${filterStatus === k ? wfTokens.border : 'transparent'}`,
                  background: filterStatus === k ? wfTokens.surfaceHi : 'transparent',
                  color: filterStatus === k ? wfTokens.text : wfTokens.textMuted,
                }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, color: wfTokens.textMuted, fontSize: 10, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <Btn primary onClick={() => openCreateTask({ project: selectedProject || undefined })}>
              <Ic d={I.plus} size={10} /> Nueva tarea
            </Btn>
          </div>
        }
      >
        Lista
      </PageTitle>

      <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <SB style={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '26px 1fr 110px 130px 140px 80px 72px 32px',
            gap: 8, padding: '8px 12px',
            background: wfTokens.surfaceLo, borderBottom: `1px solid ${wfTokens.borderSoft}`,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: wfTokens.textDim,
            textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0,
          }}>
            <div />
            <div>Tarea</div>
            <div>Estado</div>
            <div>Proyecto</div>
            <div>Etiquetas</div>
            <div>Fecha</div>
            <div>Prioridad</div>
            <div />
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {sorted.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Mono size={11}>No hay tareas</Mono>
                <div style={{ marginTop: 12 }}>
                  <Btn primary onClick={() => openCreateTask({ project: selectedProject || undefined })}>
                    <Ic d={I.plus} size={10} /> Nueva tarea
                  </Btn>
                </div>
              </div>
            )}
            {sorted.map((task, i) => {
              const p = projects.find((proj) => proj.id === task.project);
              return (
                <div key={task.id} onClick={() => setOpenTaskId(task.id)} style={{
                  display: 'grid', gridTemplateColumns: '26px 1fr 110px 130px 140px 80px 72px 32px',
                  gap: 8, padding: '8px 12px', alignItems: 'center',
                  borderBottom: `1px solid ${wfTokens.borderSoft}`,
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                  cursor: 'pointer',
                }}>
                  <Check done={task.status === 'done'} onClick={(e) => { e.stopPropagation(); updateTask(task.id, { status: task.status === 'done' ? 'new' : 'done' }); }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: task.status === 'done' ? wfTokens.textDim : wfTokens.text, textDecoration: task.status === 'done' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    {(task.subtasks || task.comments > 0) && (
                      <div style={{ display: 'flex', gap: 8, fontSize: 9, color: wfTokens.textDim }}>
                        {task.subtasks && <span><Ic d={I.check} size={8} /> {task.subtasks[0]}/{task.subtasks[1]}</span>}
                        {task.comments > 0 && <span><Ic d={I.comment} size={8} /> {task.comments}</span>}
                      </div>
                    )}
                  </div>
                  <div><StatePill k={task.status} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                    {p ? (
                      <><Dot c={p.color} size={6} /><span style={{ fontSize: 10, color: wfTokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span></>
                    ) : (
                      <Mono size={9}>—</Mono>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 3, overflow: 'hidden' }}>
                    {task.tags.slice(0, 2).map((tag, j) => <Tag key={j}>{tag}</Tag>)}
                  </div>
                  <Mono size={9}>{formatDue(task.due)}</Mono>
                  <Prio level={task.priority} />
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Ic d={I.more} size={11} /></div>
                </div>
              );
            })}
          </div>
        </SB>
      </div>
    </div>
  );
}
