import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useWF } from '../contexts/ThemeContext.jsx';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { Mono, Dot, StateDot, Prio, Ic } from './primitives/index.jsx';

export default function SearchBar() {
  const { tasks, projects, setOpenTaskId, setShowSearch } = useApp();
  const { accent } = useWF();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowSearch(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setShowSearch]);

  const q = query.trim().toLowerCase();
  const results = q.length < 1 ? [] : tasks.filter((t) =>
    t.title.toLowerCase().includes(q) ||
    t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    (t.desc || '').toLowerCase().includes(q)
  ).slice(0, 12);

  const openTask = (id) => {
    setShowSearch(false);
    setOpenTaskId(id);
  };

  return (
    <div
      className="wf-backdrop"
      onClick={() => setShowSearch(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      <div
        className="wf-search-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600, background: wfTokens.surface,
          border: `1px solid ${wfTokens.border}`, borderRadius: 12,
          overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
          <Ic d={I.search} size={16} c={wfTokens.textMuted} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tareas, etiquetas..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: wfTokens.text, fontSize: 15, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', opacity: 0.6 }}>
              <Ic d={I.x} size={12} c={wfTokens.textMuted} />
            </button>
          )}
          <div style={{ padding: '3px 7px', borderRadius: 4, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}` }}>
            <Mono size={9}>Esc</Mono>
          </div>
        </div>

        {/* Results */}
        {q.length > 0 && (
          <div style={{ maxHeight: 420, overflow: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                <Mono size={11} style={{ color: wfTokens.textDim }}>Sin resultados para "{query}"</Mono>
              </div>
            ) : (
              results.map((task) => {
                const proj = projects.find((p) => p.id === task.project);
                return (
                  <div key={task.id} onClick={() => openTask(task.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderBottom: `1px solid ${wfTokens.borderSoft}`,
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = wfTokens.surfaceHi}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <StateDot k={task.status} size={7} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: wfTokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {highlight(task.title, q, accent)}
                      </div>
                      {proj && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                          <Dot c={proj.color} size={5} />
                          <Mono size={9} style={{ color: wfTokens.textMuted }}>{proj.name}</Mono>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      <Prio level={task.priority} />
                      {task.due !== '—' && <Mono size={9}>{task.due}</Mono>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Empty state hint */}
        {q.length === 0 && (
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Mono size={9} style={{ color: wfTokens.textDim }}>SUGERENCIAS</Mono>
            {['ux', 'backend', 'alta'].map((hint) => (
              <div key={hint} onClick={() => setQuery(hint)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 5, cursor: 'pointer',
                background: wfTokens.surfaceLo, border: `1px solid ${wfTokens.borderSoft}`,
              }}>
                <Ic d={I.search} size={10} c={wfTokens.textDim} />
                <Mono size={10} style={{ color: wfTokens.textMuted }}>{hint}</Mono>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function highlight(text, q, accent) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `color-mix(in oklch, ${accent} 30%, transparent)`, color: accent, borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
