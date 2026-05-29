import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useWF } from '../contexts/ThemeContext.jsx';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { HW, Mono, SB, Dot, StateDot, Prio, Tag, Ic, UserAvatar } from './primitives/index.jsx';
import { formatDue } from '../utils/dates.js';

const PRIORITIES = [
  { value: 'high', label: 'Alta',  color: 'oklch(72% 0.18 25)' },
  { value: 'med',  label: 'Media', color: 'oklch(78% 0.16 60)' },
  { value: 'low',  label: 'Baja',  color: 'oklch(65% 0.05 220)' },
];

const STATES_ORDER = ['new', 'wait', 'exec', 'done'];

export default function TaskDetailPanel() {
  const { openTaskId, setOpenTaskId, tasks, projects, updateTask, deleteTask, projectMembers, loadProjectMembers } = useApp();
  const { accent, states } = useWF();

  const task = tasks.find((t) => t.id === openTaskId);

  const [titleEdit, setTitleEdit] = useState('');
  const [descEdit, setDescEdit] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Reset local edits when the task changes
  useEffect(() => {
    if (task) {
      setTitleEdit(task.title);
      setDescEdit(task.desc || '');
      setTagInput('');
      if (task.project && !projectMembers[task.project]) loadProjectMembers(task.project);
    }
  }, [task?.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpenTaskId(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpenTaskId]);

  if (!task) return null;

  const proj = projects.find((p) => p.id === task.project);
  const members = task.project ? (projectMembers[task.project] || []) : [];
  const change = (key, value) => updateTask(task.id, { [key]: value });

  const saveTitle = () => {
    const t = titleEdit.trim();
    if (t) change('title', t); else setTitleEdit(task.title);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !task.tags.includes(t)) change('tags', [...task.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag) => change('tags', task.tags.filter((t) => t !== tag));

  const toggleSubtask = (i) => {
    if (!task.subtasks) return;
    const [done, total] = task.subtasks;
    // Toggle: if i < done, we uncheck (done-1), else check (done+1), clamped
    const newDone = i < done ? Math.max(0, done - 1) : Math.min(total, done + 1);
    change('subtasks', [newDone, total]);
  };

  const inputCss = {
    background: 'transparent', border: 'none', outline: 'none',
    color: wfTokens.text, fontFamily: 'inherit', fontSize: 11, width: '100%',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50, display: 'flex',
    }}>
      {/* Backdrop */}
      <div onClick={() => setOpenTaskId(null)} style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />

      {/* Panel */}
      <div style={{
        width: 440, background: wfTokens.surface,
        borderLeft: `1px solid ${wfTokens.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        overflow: 'hidden',
      }}>

        {/* Status strip */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
          {STATES_ORDER.map((k) => (
            <button key={k} onClick={() => change('status', k)} style={{
              flex: 1, padding: '10px 4px', cursor: 'pointer', border: 'none',
              fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
              background: task.status === k ? `color-mix(in oklch, ${stateColor(k)} 18%, ${wfTokens.surfaceHi})` : 'transparent',
              color: task.status === k ? stateColor(k) : wfTokens.textDim,
              borderBottom: task.status === k ? `2px solid ${stateColor(k)}` : '2px solid transparent',
              textTransform: 'uppercase', letterSpacing: 0.4,
            }}>
              {states[k]}
            </button>
          ))}
          <button onClick={() => setOpenTaskId(null)} style={{ padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Ic d={I.x} size={13} c={wfTokens.textMuted} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Title */}
          <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
            <textarea
              value={titleEdit}
              onChange={(e) => setTitleEdit(e.target.value)}
              onBlur={saveTitle}
              rows={2}
              style={{
                ...inputCss, fontSize: 17, fontFamily: '"Caveat", cursive',
                lineHeight: 1.3, resize: 'none', width: '100%', display: 'block',
              }}
            />
          </div>

          {/* Priority row */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 6 }}>
            {PRIORITIES.map(({ value, label, color }) => (
              <button key={value} onClick={() => change('priority', value)} style={{
                padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 10,
                fontFamily: '"JetBrains Mono", monospace',
                border: `1px solid ${task.priority === value ? color : wfTokens.border}`,
                background: task.priority === value ? `color-mix(in oklch, ${color} 18%, transparent)` : 'transparent',
                color: task.priority === value ? color : wfTokens.textDim,
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Metadata */}
          <div style={{ borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
            {/* Project */}
            <MetaRow label="Proyecto">
              <select
                value={task.project || ''}
                onChange={(e) => change('project', e.target.value || null)}
                style={{ ...inputCss, cursor: 'pointer', color: proj ? wfTokens.text : wfTokens.textDim }}
              >
                <option value="">Sin proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {proj && <Dot c={proj.color} size={7} style={{ flexShrink: 0 }} />}
            </MetaRow>

            {/* Due date */}
            <MetaRow label="Vencimiento">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="date"
                  value={task.due === '—' ? '' : task.due}
                  onChange={(e) => change('due', e.target.value || '—')}
                  style={{ ...inputCss, flex: 1, colorScheme: 'dark' }}
                />
                {task.due !== '—' && (
                  <span style={{ fontSize: 10, color: wfTokens.textDim, whiteSpace: 'nowrap' }}>
                    {formatDue(task.due)}
                  </span>
                )}
              </div>
            </MetaRow>

            {/* Tags */}
            <MetaRow label="Etiquetas" align="flex-start" style={{ paddingTop: 10, paddingBottom: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                {task.tags.map((tag) => (
                  <span key={tag} onClick={() => removeTag(tag)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '2px 8px', borderRadius: 999, cursor: 'pointer',
                    background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                    border: `1px solid ${accent}40`,
                    color: accent, fontSize: 9, fontFamily: '"JetBrains Mono", monospace',
                  }}>
                    #{tag} <Ic d={I.x} size={7} c={accent} />
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="+ etiqueta"
                  style={{ ...inputCss, width: 80, fontSize: 9, fontFamily: '"JetBrains Mono", monospace', color: wfTokens.textDim }}
                />
              </div>
            </MetaRow>

            {/* Assigned to — only shown when project has members */}
            {members.length > 0 && (
              <MetaRow label="Asignado a">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {task.assignedTo && <UserAvatar user={{ name: task.assignedTo.name, avatarColor: task.assignedTo.color }} size={18} />}
                  <select
                    value={task.assignedTo?.id || ''}
                    onChange={(e) => change('assignedTo', e.target.value ? parseInt(e.target.value) : null)}
                    style={{ ...inputCss, cursor: 'pointer', color: task.assignedTo ? wfTokens.text : wfTokens.textDim }}
                  >
                    <option value="">Sin asignar</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </MetaRow>
            )}
          </div>

          {/* Description */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
            <Mono size={9} style={{ display: 'block', marginBottom: 8 }}>DESCRIPCIÓN</Mono>
            <textarea
              value={descEdit}
              onChange={(e) => setDescEdit(e.target.value)}
              onBlur={() => change('desc', descEdit)}
              placeholder="Añade una descripción..."
              rows={4}
              style={{
                ...inputCss, resize: 'vertical', lineHeight: 1.6,
                color: wfTokens.textMuted, fontSize: 11,
                border: `1px solid transparent`,
                padding: 6, borderRadius: 4,
              }}
            />
          </div>

          {/* Subtasks */}
          {task.subtasks && (
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Mono size={9}>SUBTAREAS</Mono>
                <Mono>{task.subtasks[0]}/{task.subtasks[1]}</Mono>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(task.subtasks[0] / task.subtasks[1]) * 100}%`, background: accent, borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
              </div>
              {Array.from({ length: task.subtasks[1] }).map((_, i) => {
                const done = i < task.subtasks[0];
                return (
                  <div key={i} onClick={() => toggleSubtask(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${wfTokens.borderSoft}`, cursor: 'pointer' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${done ? accent : wfTokens.border}`, background: done ? `color-mix(in oklch, ${accent} 22%, transparent)` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <span style={{ color: accent, fontSize: 10 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 11, color: done ? wfTokens.textDim : wfTokens.text, textDecoration: done ? 'line-through' : 'none' }}>
                      Subtarea {i + 1}
                    </span>
                  </div>
                );
              })}
              <button onClick={() => change('subtasks', [task.subtasks[0], task.subtasks[1] + 1])} style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: wfTokens.textDim, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ic d={I.plus} size={9} /> añadir subtarea
              </button>
            </div>
          )}

          {!task.subtasks && (
            <div style={{ padding: '10px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
              <button onClick={() => change('subtasks', [0, 1])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: wfTokens.textDim, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ic d={I.plus} size={9} /> añadir subtareas
              </button>
            </div>
          )}

          {/* Comments placeholder */}
          {task.comments > 0 && (
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
              <Mono size={9} style={{ display: 'block', marginBottom: 10 }}>COMENTARIOS · {task.comments}</Mono>
              {Array.from({ length: Math.min(2, task.comments) }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}`, flexShrink: 0 }} />
                  <SB style={{ flex: 1, padding: '8px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Mono color={wfTokens.textMuted}>Usuario</Mono>
                      <Mono>hace {i + 1}h</Mono>
                    </div>
                    <div style={{ fontSize: 11, color: wfTokens.textMuted, lineHeight: 1.5 }}>
                      Comentario {i + 1} sobre esta tarea.
                    </div>
                  </SB>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div style={{ padding: '12px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: 999, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}`, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: '7px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.textDim, cursor: 'text' }}>
              Añadir comentario...
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8, background: wfTokens.surfaceLo }}>
          <button onClick={() => { if (confirm('¿Eliminar esta tarea?')) deleteTask(task.id); }} style={{ padding: '7px 14px', borderRadius: 5, background: 'transparent', color: 'oklch(65% 0.18 25)', border: `1px solid oklch(65% 0.18 25)40`, cursor: 'pointer', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}>
            Eliminar
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={() => setOpenTaskId(null)} style={{ padding: '7px 20px', borderRadius: 5, background: accent, color: '#0e0e14', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 600 }}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, children, align = 'center', style }) {
  return (
    <div style={{ display: 'flex', alignItems: align, gap: 10, padding: '8px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, ...style }}>
      <Mono size={9} style={{ width: 90, flexShrink: 0 }}>{label.toUpperCase()}</Mono>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>{children}</div>
    </div>
  );
}
