import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { useWF } from '../../contexts/ThemeContext.jsx';
import { wfTokens } from '../../constants/tokens.js';
import { I } from '../../constants/icons.js';
import { HW, Mono, Ic } from '../primitives/index.jsx';
import { todayISO } from '../../utils/dates.js';

const PRIORITIES = [
  { value: 'high', label: 'Alta', color: 'oklch(72% 0.18 25)' },
  { value: 'med',  label: 'Media', color: 'oklch(78% 0.16 60)' },
  { value: 'low',  label: 'Baja', color: 'oklch(65% 0.05 220)' },
];

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Mono size={9}>{label}</Mono>
      {children}
    </div>
  );
}

export default function CreateTaskModal() {
  const { setShowCreateTask, createTask, projects, createTaskDefaults, setOpenTaskId } = useApp();
  const { accent, states } = useWF();

  const [form, setForm] = useState({
    title: '',
    desc: '',
    priority: createTaskDefaults.priority || 'med',
    status: createTaskDefaults.status || 'new',
    project: createTaskDefaults.project || '',
    due: createTaskDefaults.due || todayISO(),
    tagInput: '',
    tags: [],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowCreateTask(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setShowCreateTask]);

  const addTag = () => {
    const t = form.tagInput.trim().toLowerCase().replace(/^#/, '');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    set('tagInput', '');
  };

  const removeTag = (tag) => set('tags', form.tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const task = await createTask({
      title: form.title.trim(),
      desc: form.desc.trim(),
      priority: form.priority,
      status: form.status,
      project: form.project || null,
      due: form.due || '—',
      tags: form.tags,
    });
    setShowCreateTask(false);
    setOpenTaskId(task.id);
  };

  const inputCss = {
    padding: '8px 12px', borderRadius: 5,
    border: `1px solid ${wfTokens.border}`,
    background: wfTokens.surfaceLo,
    color: wfTokens.text, fontSize: 11,
    fontFamily: 'inherit', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  const selectCss = { ...inputCss, cursor: 'pointer' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)',
    }}>
      <div style={{
        width: 580, background: wfTokens.surface,
        border: `1px solid ${wfTokens.border}`, borderRadius: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <HW size={20}>Nueva tarea</HW>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowCreateTask(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 4 }}>
            <Ic d={I.x} size={14} c={wfTokens.textMuted} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title */}
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Título de la tarea..."
              style={{
                ...inputCss,
                padding: '10px 0', fontSize: 20,
                fontFamily: '"Caveat", cursive',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${form.title ? accent : wfTokens.border}`,
                borderRadius: 0,
              }}
            />

            {/* Description */}
            <textarea
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
              placeholder="Descripción (opcional)..."
              rows={2}
              style={{ ...inputCss, background: 'transparent', border: `1px solid ${wfTokens.borderSoft}`, resize: 'none', lineHeight: 1.6 }}
            />

            {/* Grid of fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="ESTADO">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={selectCss}>
                  {Object.entries(states).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>

              <Field label="PRIORIDAD">
                <div style={{ display: 'flex', gap: 6 }}>
                  {PRIORITIES.map(({ value, label, color }) => (
                    <button key={value} type="button" onClick={() => set('priority', value)} style={{
                      flex: 1, padding: '7px 4px', borderRadius: 5, cursor: 'pointer', fontSize: 10,
                      fontFamily: 'inherit', border: `1px solid ${form.priority === value ? color : wfTokens.border}`,
                      background: form.priority === value ? `color-mix(in oklch, ${color} 18%, ${wfTokens.surfaceLo})` : wfTokens.surfaceLo,
                      color: form.priority === value ? color : wfTokens.textMuted,
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="PROYECTO">
                <select value={form.project} onChange={(e) => set('project', e.target.value)} style={selectCss}>
                  <option value="">Sin proyecto</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>

              <Field label="FECHA DE VENCIMIENTO">
                <input
                  type="date"
                  value={form.due}
                  onChange={(e) => set('due', e.target.value)}
                  style={{ ...inputCss, colorScheme: 'dark' }}
                />
              </Field>
            </div>

            {/* Tags */}
            <Field label="ETIQUETAS">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, minHeight: 38 }}>
                {form.tags.map((tag) => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `color-mix(in oklch, ${accent} 15%, transparent)`, border: `1px solid ${accent}40`, color: accent, fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}>
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}>
                      <Ic d={I.x} size={8} c={accent} />
                    </button>
                  </span>
                ))}
                <input
                  value={form.tagInput}
                  onChange={(e) => set('tagInput', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } if (e.key === ',' ) { e.preventDefault(); addTag(); } }}
                  placeholder={form.tags.length === 0 ? 'ux, backend... (Enter para añadir)' : ''}
                  style={{ background: 'none', border: 'none', outline: 'none', color: wfTokens.text, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', minWidth: 120 }}
                />
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8, justifyContent: 'flex-end', background: wfTokens.surfaceLo }}>
            <button type="button" onClick={() => setShowCreateTask(false)} style={{ padding: '8px 16px', borderRadius: 5, background: 'transparent', color: wfTokens.textMuted, border: `1px solid ${wfTokens.border}`, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" style={{
              padding: '8px 20px', borderRadius: 5, background: form.title.trim() ? accent : wfTokens.border,
              color: '#0e0e14', border: 'none', cursor: form.title.trim() ? 'pointer' : 'not-allowed',
              fontSize: 11, fontFamily: 'inherit', fontWeight: 600,
            }}>
              Crear tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
