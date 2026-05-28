import { useState, useRef, useEffect } from 'react';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useWF } from '../contexts/ThemeContext.jsx';
import { HW, Mono, SB, Dot, Prio, Btn, Ic, Check } from '../components/primitives/index.jsx';
import { PageTitle, TaskCard } from '../components/chrome/index.jsx';

const STATES = ['new', 'wait', 'exec', 'done'];

// ── Filter popover ───────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [onClose]);

  const toggle = (key, val) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));

  const priOptions = [['high', 'Alta', 'oklch(72% 0.18 25)'], ['med', 'Media', 'oklch(78% 0.16 60)'], ['low', 'Baja', 'oklch(65% 0.05 220)']];
  const hasActive = filters.priority.length > 0 || filters.hideDone;

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 50,
      background: wfTokens.surface, border: `1px solid ${wfTokens.border}`,
      borderRadius: 8, boxShadow: '0 8px 28px rgba(0,0,0,0.3)', padding: 14,
      minWidth: 220, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Priority */}
      <div>
        <Mono size={9} style={{ display: 'block', marginBottom: 8, color: wfTokens.textDim }}>PRIORIDAD</Mono>
        <div style={{ display: 'flex', gap: 6 }}>
          {priOptions.map(([val, label, c]) => {
            const active = filters.priority.includes(val);
            return (
              <button key={val} onClick={() => toggle('priority', val)} style={{
                flex: 1, padding: '5px 6px', borderRadius: 5, cursor: 'pointer', fontSize: 10,
                fontFamily: 'inherit', border: `1px solid ${active ? c : wfTokens.border}`,
                background: active ? `color-mix(in oklch, ${c} 18%, ${wfTokens.surfaceLo})` : wfTokens.surfaceLo,
                color: active ? c : wfTokens.textMuted,
              }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hide done */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8, borderTop: `1px solid ${wfTokens.borderSoft}` }}>
        <Check done={filters.hideDone} size={13} onClick={() => setFilters((f) => ({ ...f, hideDone: !f.hideDone }))} />
        <span style={{ fontSize: 11, color: wfTokens.text, cursor: 'pointer' }} onClick={() => setFilters((f) => ({ ...f, hideDone: !f.hideDone }))}>
          Ocultar finalizadas
        </span>
      </div>

      {/* Clear */}
      {hasActive && (
        <button onClick={() => { setFilters({ priority: [], hideDone: false }); onClose(); }} style={{
          padding: '6px', borderRadius: 5, cursor: 'pointer', fontSize: 10,
          fontFamily: 'inherit', border: `1px solid ${wfTokens.border}`,
          background: 'transparent', color: wfTokens.textMuted,
        }}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

// ── Kanban card ───────────────────────────────────────────────
function KanbanCard({ task, onOpen }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('taskId', String(task.id)); e.dataTransfer.effectAllowed = 'move'; setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      style={{ opacity: dragging ? 0.4 : 1, cursor: 'grab' }}
    >
      <TaskCard
        title={task.title} prio={task.priority} due={task.due}
        tags={task.tags} subs={task.subtasks} comments={task.comments}
        state={task.status} onClick={onOpen}
      />
    </div>
  );
}

// ── Kanban column ─────────────────────────────────────────────
function KanbanColumn({ k, tasks, onOpenTask, onAddTask }) {
  const { updateTask } = useApp();
  const { states } = useWF();
  const [dragOver, setDragOver] = useState(false);
  const colColor = stateColor(k);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    if (!isNaN(taskId)) updateTask(taskId, { status: k });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '0 2px' }}>
        <Dot c={colColor} size={8} />
        <HW size={18} color={wfTokens.text}>{states[k]}</HW>
        <Mono color={wfTokens.textDim}>{tasks.length}</Mono>
        <div style={{ flex: 1 }} />
        <button onClick={() => onAddTask({ status: k })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 3, color: wfTokens.textDim }}>
          <Ic d={I.plus} size={12} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 3 }}>
          <Ic d={I.more} size={12} />
        </button>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
        onDrop={handleDrop}
        style={{
          background: dragOver ? `color-mix(in oklch, ${colColor} 8%, ${wfTokens.surfaceLo})` : wfTokens.surfaceLo,
          border: `1px ${dragOver ? 'solid' : 'dashed'} ${dragOver ? colColor : wfTokens.borderSoft}`,
          borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
          flex: 1, overflow: 'auto', transition: 'background 0.15s, border-color 0.15s', minHeight: 120,
        }}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onOpen={() => onOpenTask(task.id)} />
        ))}
        {tasks.length === 0 && !dragOver && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mono size={9} style={{ color: wfTokens.textDim }}>Sin tareas</Mono>
          </div>
        )}
        <button onClick={() => onAddTask({ status: k })} style={{
          padding: '6px', textAlign: 'center', color: wfTokens.textDim, fontSize: 10,
          border: `1px dashed ${wfTokens.borderSoft}`, borderRadius: 5, cursor: 'pointer',
          background: 'transparent', fontFamily: 'inherit', marginTop: tasks.length === 0 ? 0 : 2,
        }}>
          + añadir tarea
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function BoardPage() {
  const { tasks, projects, selectedProject, setOpenTaskId, openCreateTask } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ priority: [], hideDone: false });
  const filterBtnRef = useRef(null);

  const proj = selectedProject ? projects.find((p) => p.id === selectedProject) : null;

  let filtered = selectedProject ? tasks.filter((t) => t.project === selectedProject) : tasks;
  if (filters.priority.length > 0) filtered = filtered.filter((t) => filters.priority.includes(t.priority));
  if (filters.hideDone) filtered = filtered.filter((t) => t.status !== 'done');

  const activeFilterCount = filters.priority.length + (filters.hideDone ? 1 : 0);

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle
        sub={proj ? `${proj.name} · ${filtered.filter(t => t.status !== 'done').length} activas` : `todas las tareas · ${filtered.filter(t => t.status !== 'done').length} activas`}
        right={
          <div style={{ display: 'flex', gap: 6 }}>
            <div ref={filterBtnRef} style={{ position: 'relative' }}>
              <Btn ghost onClick={() => setShowFilters((v) => !v)}>
                <Ic d={I.filter} size={10} /> Filtros
                {activeFilterCount > 0 && (
                  <span style={{
                    marginLeft: 4, padding: '1px 5px', borderRadius: 999, fontSize: 9,
                    background: 'var(--wf-accent)', color: '#0e0e14', fontWeight: 600,
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </Btn>
              {showFilters && (
                <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
              )}
            </div>
            <Btn primary onClick={() => openCreateTask({ project: selectedProject || undefined })}>
              <Ic d={I.plus} size={10} /> Nueva tarea
            </Btn>
          </div>
        }
      >
        Tablero
      </PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '4px 22px 22px', flex: 1, overflow: 'hidden' }}>
        {STATES.map((k) => (
          <KanbanColumn
            key={k}
            k={k}
            tasks={filtered.filter((t) => t.status === k)}
            onOpenTask={setOpenTaskId}
            onAddTask={openCreateTask}
          />
        ))}
      </div>
    </div>
  );
}
