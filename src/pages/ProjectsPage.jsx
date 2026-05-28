import { useState, useEffect, useRef } from 'react';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useWF } from '../contexts/ThemeContext.jsx';
import { HW, Mono, SB, Dot, Pill, Prio, Tag, StatePill, Btn, Ic, Check } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';
import { formatDue } from '../utils/dates.js';

const STATES = ['new', 'wait', 'exec', 'done'];

function ProjectCard({ proj, projTasks, active, onClick, onDelete }) {
  const done = projTasks.filter((t) => t.status === 'done').length;
  const total = projTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px', cursor: 'pointer', borderRadius: 6,
        background: active ? wfTokens.surfaceHi : 'transparent',
        border: `1px solid ${active ? wfTokens.border : 'transparent'}`,
        borderLeft: `3px solid ${active ? proj.color : 'transparent'}`,
        display: 'flex', flexDirection: 'column', gap: 8,
        opacity: proj.status === 'archivado' ? 0.5 : 1,
        transition: 'background 0.1s, border-color 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Dot c={proj.color} size={7} />
        <span style={{ flex: 1, fontSize: 12, color: wfTokens.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {proj.name}
        </span>
        {proj.status !== 'activo' && <Pill c={wfTokens.textDim} style={{ fontSize: 8 }}>{proj.status}</Pill>}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.35, borderRadius: 3 }}
        >
          <Ic d={I.x} size={10} c={wfTokens.textMuted} />
        </button>
      </div>

      <div>
        <div style={{ height: 3, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: proj.color, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Mono size={9}>{done}/{total} tareas</Mono>
        <div style={{ flex: 1 }} />
        {STATES.map((k) => {
          const n = projTasks.filter((t) => t.status === k).length;
          if (n === 0) return null;
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: 999, background: stateColor(k) }} />
              <Mono size={8}>{n}</Mono>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task, onClick, onToggleDone }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', cursor: 'pointer', borderRadius: 5,
        transition: 'background 0.08s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = wfTokens.surfaceHi; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Check
        done={task.status === 'done'} size={12}
        onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
      />
      <span style={{
        flex: 1, fontSize: 11, color: task.status === 'done' ? wfTokens.textDim : wfTokens.text,
        textDecoration: task.status === 'done' ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {task.title}
      </span>
      {task.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 3 }}>
          {task.tags.slice(0, 2).map((t, i) => <Tag key={i}>{t}</Tag>)}
        </div>
      )}
      <Prio level={task.priority} />
      {task.due && task.due !== '—' && <Mono size={9}>{formatDue(task.due)}</Mono>}
    </div>
  );
}

export default function ProjectsPage() {
  const { tasks, projects, setOpenTaskId, openCreateTask, setShowCreateProject, deleteProject, updateTask, updateProject } = useApp();
  const { states, accent } = useWF();

  const [activeProjId, setActiveProjId] = useState(projects[0]?.id ?? null);
  const [nameEdit, setNameEdit] = useState('');
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);

  const activeProj = projects.find((p) => p.id === activeProjId);

  useEffect(() => {
    if (activeProj) setNameEdit(activeProj.name);
    setEditingName(false);
  }, [activeProjId]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.select();
  }, [editingName]);

  const saveName = () => {
    const trimmed = nameEdit.trim();
    if (trimmed && trimmed !== activeProj.name) updateProject(activeProjId, { name: trimmed });
    else setNameEdit(activeProj.name);
    setEditingName(false);
  };

  const saveDue = (val) => {
    updateProject(activeProjId, { due: val || '—' });
  };
  const projTasks = activeProjId ? tasks.filter((t) => t.project === activeProjId) : [];
  const done = projTasks.filter((t) => t.status === 'done').length;
  const total = projTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle
        sub={`${projects.filter((p) => p.status === 'activo').length} activos · ${projects.filter((p) => p.status === 'pausa').length} en pausa`}
        right={
          <Btn primary onClick={() => setShowCreateProject(true)}>
            <Ic d={I.plus} size={10} /> Nuevo proyecto
          </Btn>
        }
      >
        Proyectos
      </PageTitle>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* ── Left: project list ─────────────────────────── */}
        <div style={{
          width: 260, flexShrink: 0, borderRight: `1px solid ${wfTokens.borderSoft}`,
          background: wfTokens.surfaceLo, padding: '8px 10px',
          display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto',
        }}>
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              projTasks={tasks.filter((t) => t.project === proj.id)}
              active={proj.id === activeProjId}
              onClick={() => setActiveProjId(proj.id)}
              onDelete={() => { if (confirm(`¿Eliminar "${proj.name}"?`)) { deleteProject(proj.id); if (activeProjId === proj.id) setActiveProjId(projects.find((p) => p.id !== proj.id)?.id ?? null); } }}
            />
          ))}

          {/* New project */}
          <div
            onClick={() => setShowCreateProject(true)}
            style={{
              padding: '10px 14px', cursor: 'pointer', borderRadius: 6, marginTop: 4,
              border: `1px dashed ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8,
              color: wfTokens.textDim,
            }}
          >
            <Ic d={I.plus} size={11} />
            <Mono>Nuevo proyecto</Mono>
          </div>
        </div>

        {/* ── Right: project detail ──────────────────────── */}
        {activeProj ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Project header */}
            <div style={{
              padding: '16px 22px 14px', borderBottom: `1px solid ${wfTokens.borderSoft}`,
              background: wfTokens.surface, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: activeProj.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {editingName ? (
                      <input
                        ref={nameInputRef}
                        value={nameEdit}
                        onChange={(e) => setNameEdit(e.target.value)}
                        onBlur={saveName}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameEdit(activeProj.name); setEditingName(false); } }}
                        style={{
                          fontSize: 24, fontFamily: '"Caveat", cursive', fontWeight: 700,
                          background: 'transparent', border: 'none', borderBottom: `2px solid ${accent}`,
                          outline: 'none', color: wfTokens.text, padding: '0 2px', minWidth: 120,
                        }}
                      />
                    ) : (
                      <HW size={24} style={{ cursor: 'text' }} onClick={() => setEditingName(true)}>
                        {activeProj.name}
                      </HW>
                    )}
                    {activeProj.status !== 'activo' && <Pill c={wfTokens.textDim}>{activeProj.status}</Pill>}
                    <div style={{ flex: 1 }} />
                    <Btn primary onClick={() => openCreateTask({ project: activeProjId })}>
                      <Ic d={I.plus} size={10} /> Nueva tarea
                    </Btn>
                  </div>
                  {activeProj.desc && (
                    <div style={{ marginTop: 4, fontSize: 11, color: wfTokens.textMuted, lineHeight: 1.5 }}>{activeProj.desc}</div>
                  )}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: wfTokens.border, overflow: 'hidden', maxWidth: 240 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: activeProj.color, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <Mono size={9}>{done}/{total} completadas · {pct}%</Mono>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Ic d={I.cal} size={10} c={wfTokens.textDim} />
                      <input
                        type="date"
                        value={activeProj.due === '—' ? '' : activeProj.due}
                        onChange={(e) => saveDue(e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', outline: 'none',
                          color: activeProj.due && activeProj.due !== '—' ? wfTokens.textMuted : wfTokens.textDim,
                          fontSize: 9, fontFamily: 'inherit', cursor: 'pointer',
                          colorScheme: 'dark', width: activeProj.due && activeProj.due !== '—' ? 'auto' : 80,
                        }}
                        title="Fecha de vencimiento"
                      />
                      {activeProj.due && activeProj.due !== '—' && (
                        <Mono size={9} style={{ color: wfTokens.textDim }}>({formatDue(activeProj.due)})</Mono>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task list grouped by state */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 22px 22px' }}>
              {projTasks.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <Mono size={11}>Sin tareas en este proyecto</Mono>
                  <Btn primary onClick={() => openCreateTask({ project: activeProjId })}>
                    <Ic d={I.plus} size={10} /> Añadir tarea
                  </Btn>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {STATES.map((k) => {
                    const group = projTasks.filter((t) => t.status === k);
                    if (group.length === 0) return null;
                    return (
                      <div key={k}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, padding: '0 12px' }}>
                          <div style={{ width: 6, height: 6, borderRadius: 999, background: stateColor(k) }} />
                          <Mono size={9} style={{ color: wfTokens.textMuted }}>{states[k]}</Mono>
                          <Mono size={9}>{group.length}</Mono>
                          <div style={{ flex: 1, height: 1, background: wfTokens.borderSoft, marginLeft: 4 }} />
                          <button
                            onClick={() => openCreateTask({ project: activeProjId, status: k })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', borderRadius: 3 }}
                          >
                            <Ic d={I.plus} size={10} />
                          </button>
                        </div>
                        <SB style={{ padding: 4 }}>
                          {group.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              onClick={() => setOpenTaskId(task.id)}
                              onToggleDone={() => updateTask(task.id, { status: task.status === 'done' ? 'new' : 'done' })}
                            />
                          ))}
                        </SB>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mono>Selecciona un proyecto</Mono>
          </div>
        )}
      </div>
    </div>
  );
}
