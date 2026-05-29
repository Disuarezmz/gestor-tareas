import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { useWF } from '../../contexts/ThemeContext.jsx';
import { wfTokens } from '../../constants/tokens.js';
import { I } from '../../constants/icons.js';
import { HW, Mono, Ic } from '../primitives/index.jsx';

const COLORS = [
  'oklch(72% 0.13 285)',
  'oklch(75% 0.13 210)',
  'oklch(78% 0.13 145)',
  'oklch(76% 0.13 60)',
  'oklch(70% 0.15 25)',
  'oklch(72% 0.13 320)',
  'oklch(68% 0.09 250)',
  'oklch(65% 0.08 180)',
];

export default function CreateProjectModal() {
  const { setShowCreateProject, createProject, navigate, setSelectedProject } = useApp();
  const { accent } = useWF();

  const [form, setForm] = useState({ name: '', desc: '', color: COLORS[0] });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setShowCreateProject(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setShowCreateProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const proj = await createProject({ name: form.name.trim(), desc: form.desc.trim(), color: form.color });
    setShowCreateProject(false);
    setSelectedProject(proj.id);
    navigate('projects');
  };

  const inputCss = {
    padding: '8px 12px', borderRadius: 5,
    border: `1px solid ${wfTokens.border}`,
    background: wfTokens.surfaceLo,
    color: wfTokens.text, fontSize: 11,
    fontFamily: 'inherit', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  };

  return (
    <div className="wf-backdrop" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)',
    }}>
      <div className="wf-modal" style={{
        width: 460, background: wfTokens.surface,
        border: `1px solid ${wfTokens.border}`, borderRadius: 10,
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Colored top strip */}
        <div style={{ height: 4, background: form.color }} />

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center' }}>
          <HW size={20}>Nuevo proyecto</HW>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowCreateProject(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
            <Ic d={I.x} size={14} c={wfTokens.textMuted} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Mono size={9}>NOMBRE DEL PROYECTO</Mono>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nombre del proyecto..."
              style={{ ...inputCss, fontSize: 16, fontFamily: '"Caveat", cursive', padding: '10px 12px' }}
            />
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Mono size={9}>DESCRIPCIÓN (OPCIONAL)</Mono>
            <textarea
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
              placeholder="Qué incluye este proyecto..."
              rows={2}
              style={{ ...inputCss, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {/* Color picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Mono size={9}>COLOR</Mono>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set('color', c)} style={{
                  width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer',
                  border: form.color === c ? `3px solid ${wfTokens.text}` : `2px solid transparent`,
                  outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: 2,
                  boxSizing: 'border-box',
                }} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: `1px solid ${wfTokens.borderSoft}`, marginTop: 4 }}>
            <button type="button" onClick={() => setShowCreateProject(false)} style={{ padding: '8px 16px', borderRadius: 5, background: 'transparent', color: wfTokens.textMuted, border: `1px solid ${wfTokens.border}`, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" style={{
              padding: '8px 20px', borderRadius: 5,
              background: form.name.trim() ? form.color : wfTokens.border,
              color: '#0e0e14', border: 'none',
              cursor: form.name.trim() ? 'pointer' : 'not-allowed',
              fontSize: 11, fontFamily: 'inherit', fontWeight: 600,
            }}>
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
