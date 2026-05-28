// Shared wireframe primitives, theme tokens, chrome.
// Loaded first; everything attached to window for other files.

const { useState, useContext, createContext, useMemo, useEffect, Fragment } = React;

const wfTokens = {
  bg: '#14141a',
  surface: '#1c1c24',
  surfaceHi: '#23232f',
  surfaceLo: '#101015',
  border: '#353545',
  borderSoft: '#26262f',
  text: '#e6e6ee',
  textMuted: '#9b9bac',
  textDim: '#6e6e7c',
  // State hues (low-chroma, dark-mode friendly)
  hueNew:  'oklch(72% 0.09 235)',  // blue
  hueWait: 'oklch(78% 0.11 80)',   // amber
  hueExec: 'oklch(72% 0.13 320)',  // magenta
  hueDone: 'oklch(70% 0.09 150)',  // green
  hueHigh: 'oklch(72% 0.16 25)',   // red
  hueMed:  'oklch(76% 0.11 75)',   // amber
  hueLow:  'oklch(70% 0.05 245)',  // dim
};

const WFTheme = React.createContext({
  accent: 'oklch(72% 0.13 285)',
  states: { new: 'Nueva', wait: 'En espera', exec: 'En ejecución', done: 'Finalizada' },
  sidebar: true,
  mainView: 'kanban',
});

const useWF = () => useContext(WFTheme);

// State color mapper using context-friendly fixed hues
const stateColor = (k) => ({ new: wfTokens.hueNew, wait: wfTokens.hueWait, exec: wfTokens.hueExec, done: wfTokens.hueDone })[k];

// ── Primitives ────────────────────────────────────────────────────────

function Page({ children, style }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: wfTokens.bg, color: wfTokens.text,
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      fontSize: 11, lineHeight: 1.4,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      ...style,
    }}>{children}</div>
  );
}

// Hand-written label
function HW({ children, size = 18, color, style }) {
  return <span style={{
    fontFamily: '"Caveat", cursive', fontWeight: 500,
    fontSize: size, color: color || wfTokens.text,
    letterSpacing: 0.2, lineHeight: 1, ...style,
  }}>{children}</span>;
}

// Monospace placeholder text
function Mono({ children, size = 10, color, style }) {
  return <span style={{
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: size, color: color || wfTokens.textDim,
    letterSpacing: 0.2, ...style,
  }}>{children}</span>;
}

// Dashed-or-solid container
function SB({ children, dashed, hi, style, ...props }) {
  return <div style={{
    border: `1px ${dashed ? 'dashed' : 'solid'} ${wfTokens.border}`,
    borderRadius: 6,
    background: hi ? wfTokens.surfaceHi : wfTokens.surface,
    ...style,
  }} {...props}>{children}</div>;
}

// Placeholder line
function L({ w = '80%', h = 6, c, style }) {
  return <div style={{
    width: typeof w === 'number' ? `${w}%` : w,
    height: h, borderRadius: 2,
    background: c || wfTokens.border, ...style,
  }} />;
}

function Lines({ widths = [90, 70, 80], h = 5, gap = 4, c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {widths.map((w, i) => <L key={i} w={w} h={h} c={c} />)}
    </div>
  );
}

// Sketchy stripe placeholder (for images / drop zones)
function Stripe({ h = 100, label, style }) {
  return (
    <div style={{
      height: h,
      background: `repeating-linear-gradient(135deg, ${wfTokens.surfaceHi} 0 6px, ${wfTokens.surface} 6px 12px)`,
      border: `1px dashed ${wfTokens.border}`,
      borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {label && <Mono color={wfTokens.textMuted}>{label}</Mono>}
    </div>
  );
}

// Pill / badge
function Pill({ children, c, fill, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 999,
      border: `1px solid ${c || wfTokens.border}`,
      background: fill ? `color-mix(in oklch, ${c || wfTokens.border} 18%, transparent)` : 'transparent',
      color: c || wfTokens.textMuted,
      fontSize: 9, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.3,
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

function Dot({ c, size = 7, style }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: 999, background: c || wfTokens.border, ...style }} />;
}

function StateDot({ k, size = 7 }) { return <Dot c={stateColor(k)} size={size} />; }

function StatePill({ k }) {
  const { states } = useWF();
  return <Pill c={stateColor(k)} fill><Dot c={stateColor(k)} size={6} />{states[k]}</Pill>;
}

function Prio({ level }) {
  const map = { high: ['Alta', wfTokens.hueHigh], med: ['Media', wfTokens.hueMed], low: ['Baja', wfTokens.hueLow] };
  const [label, c] = map[level] || map.low;
  return <Pill c={c}>{label}</Pill>;
}

function Tag({ children, c }) {
  return <Pill c={c || wfTokens.textDim} style={{ borderStyle: 'dashed' }}>#{children}</Pill>;
}

function Btn({ children, primary, ghost, style, w }) {
  const { accent } = useWF();
  const bg = primary ? accent : ghost ? 'transparent' : wfTokens.surfaceHi;
  const fg = primary ? '#0e0e14' : ghost ? wfTokens.textMuted : wfTokens.text;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '5px 11px', borderRadius: 5,
      background: bg, color: fg,
      border: ghost ? `1px solid ${wfTokens.border}` : primary ? `1px solid ${accent}` : `1px solid ${wfTokens.border}`,
      fontSize: 10, fontWeight: 500,
      width: w,
      ...style,
    }}>{children}</div>
  );
}

// Hand-drawn checkbox
function Check({ done, size = 10 }) {
  const { accent } = useWF();
  return (
    <div style={{
      width: size, height: size, borderRadius: 3,
      border: `1px solid ${done ? accent : wfTokens.border}`,
      background: done ? `color-mix(in oklch, ${accent} 25%, transparent)` : 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {done && <span style={{ color: accent, fontSize: size - 2, lineHeight: 1 }}>✓</span>}
    </div>
  );
}

// Icon (sketchy)— uses outline boxy glyphs
function Ic({ d, size = 12, c, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke={c || wfTokens.textMuted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      <path d={d} />
    </svg>
  );
}
// path library
const I = {
  search: 'M7 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10ZM14 14l-3.5-3.5',
  plus: 'M8 3v10M3 8h10',
  filter: 'M2 3h12l-4 6v4l-4 1V9L2 3Z',
  bell: 'M4 11h8l-1-2V7a3 3 0 0 0-6 0v2l-1 2ZM7 13a1 1 0 0 0 2 0',
  cal: 'M3 4h10v9H3zM3 7h10M5 2v3M11 2v3',
  cog: 'M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-3v2m0 8v2m5-5h-2M5 8H3m9.2-3.2-1.4 1.4m-5.6 5.6L4 13M13 13l-1.4-1.4m-5.6-5.6L4 4',
  list: 'M3 4h10M3 8h10M3 12h10',
  grid: 'M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z',
  user: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 14c0-3 2-5 5-5s5 2 5 5',
  link: 'M6 10l4-4M5 7a2.5 2.5 0 0 1 0-3.5l1-1a2.5 2.5 0 0 1 3.5 3.5L8 7M11 9a2.5 2.5 0 0 1 0 3.5l-1 1a2.5 2.5 0 0 1-3.5-3.5L8 9',
  star: 'M8 2l1.8 3.7 4 .6-3 2.8.8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.6L8 2z',
  more: 'M3 8h.01M8 8h.01M13 8h.01',
  arrow: 'M3 8h10M9 4l4 4-4 4',
  chev: 'M5 6l3 3 3-3',
  clock: 'M8 4v4l2 2M8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12Z',
  check: 'M3 8l3 3 7-7',
  x: 'M3 3l10 10M13 3 3 13',
  folder: 'M2 4h4l1 1h7v8H2V4Z',
  flag: 'M3 14V2m0 0h8l-2 3 2 3H3',
  comment: 'M2 3h12v8H7l-3 3v-3H2V3Z',
  attach: 'M10 7l-3 3a2 2 0 0 1-3-3l5-5a3 3 0 0 1 4 4l-5 5',
};

// ── Chrome: top-bar nav + optional sidebar ────────────────────────────

function TopBar({ active = 'kanban', search = true, action }) {
  const { accent, sidebar } = useWF();
  const tabs = [
    ['dashboard', 'Inicio'],
    ['kanban', 'Tablero'],
    ['list', 'Lista'],
    ['calendar', 'Calendario'],
    ['projects', 'Proyectos'],
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '0 18px', height: 44,
      borderBottom: `1px solid ${wfTokens.borderSoft}`,
      background: wfTokens.surfaceLo, flexShrink: 0,
    }}>
      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4,
          background: `linear-gradient(135deg, ${accent}, color-mix(in oklch, ${accent} 50%, ${wfTokens.bg}))`,
        }} />
        <HW size={17}>tareas</HW>
      </div>
      {/* tabs */}
      <div style={{ display: 'flex', gap: 2, marginLeft: 14 }}>
        {tabs.map(([k, label]) => (
          <div key={k} style={{
            padding: '6px 11px', borderRadius: 5,
            background: active === k ? wfTokens.surfaceHi : 'transparent',
            color: active === k ? wfTokens.text : wfTokens.textMuted,
            fontSize: 11,
            border: active === k ? `1px solid ${wfTokens.border}` : '1px solid transparent',
          }}>{label}</div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {search && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 5,
          border: `1px solid ${wfTokens.border}`, background: wfTokens.surface,
          width: 220, color: wfTokens.textDim,
        }}>
          <Ic d={I.search} />
          <Mono>buscar...</Mono>
          <div style={{ flex: 1 }} />
          <Mono color={wfTokens.textDim}>⌘K</Mono>
        </div>
      )}
      {action || (<>
        <Ic d={I.bell} size={14} />
        <Ic d={I.cog} size={14} />
        <div style={{ width: 22, height: 22, borderRadius: 999, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}` }} />
      </>)}
    </div>
  );
}

function Sidebar({ active = 'rediseno', compact, w = 180 }) {
  const { sidebar, accent } = useWF();
  if (!sidebar) return null;
  const projects = [
    ['rediseno', 'Rediseño app', wfTokens.hueExec],
    ['marketing', 'Marketing Q3', wfTokens.hueWait],
    ['backend', 'Backend v2', wfTokens.hueNew],
    ['personal', 'Personal', wfTokens.hueDone],
    ['ideas', 'Ideas', wfTokens.textDim],
  ];
  return (
    <div style={{
      width: w, flexShrink: 0,
      borderRight: `1px solid ${wfTokens.borderSoft}`,
      background: wfTokens.surfaceLo,
      padding: '14px 10px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div>
        <Mono color={wfTokens.textDim} size={9}>PROYECTOS</Mono>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          {projects.map(([k, name, c]) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 8px', borderRadius: 4,
              background: active === k ? wfTokens.surfaceHi : 'transparent',
              border: active === k ? `1px solid ${wfTokens.border}` : '1px solid transparent',
              color: active === k ? wfTokens.text : wfTokens.textMuted,
            }}>
              <Dot c={c} size={6} />
              <span style={{ fontSize: 11 }}>{name}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', color: wfTokens.textDim }}>
            <Ic d={I.plus} size={10} />
            <Mono>nuevo proyecto</Mono>
          </div>
        </div>
      </div>
      <div>
        <Mono color={wfTokens.textDim} size={9}>VISTAS</Mono>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          {['Hoy', 'Esta semana', 'Atrasadas', 'Sin proyecto'].map(v => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', color: wfTokens.textMuted, fontSize: 11 }}>
              <span style={{ width: 6, height: 6, border: `1px solid ${wfTokens.border}`, borderRadius: 1 }} />
              {v}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderTop: `1px solid ${wfTokens.borderSoft}`, paddingTop: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 999, background: wfTokens.surfaceHi }} />
        <div>
          <div style={{ fontSize: 10, color: wfTokens.text }}>tú</div>
          <Mono size={9}>plan personal</Mono>
        </div>
      </div>
    </div>
  );
}

function PageTitle({ children, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px 22px 10px' }}>
      <div>
        <HW size={28}>{children}</HW>
        {sub && <div style={{ marginTop: 3 }}><Mono>{sub}</Mono></div>}
      </div>
      {right}
    </div>
  );
}

// Task card used in many views
function TaskCard({ title, prio, due, tags = [], subs, comments, state, dense, style }) {
  const { accent } = useWF();
  return (
    <SB hi style={{
      padding: dense ? 8 : 10,
      display: 'flex', flexDirection: 'column', gap: dense ? 5 : 7,
      borderLeft: state ? `2px solid ${stateColor(state)}` : `1px solid ${wfTokens.border}`,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ flex: 1, fontSize: dense ? 10 : 11, color: wfTokens.text, lineHeight: 1.3 }}>{title}</div>
        {prio && <Prio level={prio} />}
      </div>
      {subs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Ic d={I.check} size={10} />
          <Mono>{subs[0]}/{subs[1]}</Mono>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(subs[0]/subs[1])*100}%`, background: accent }} />
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
        {due && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: wfTokens.textMuted, fontSize: 9 }}>
          <Ic d={I.cal} size={10} /> {due}
        </span>}
        <div style={{ flex: 1 }} />
        {comments != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: wfTokens.textDim, fontSize: 9 }}>
          <Ic d={I.comment} size={10} /> {comments}
        </span>}
      </div>
    </SB>
  );
}

// Column header for kanban
function ColHead({ k, count }) {
  const { states } = useWF();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <Dot c={stateColor(k)} size={8} />
      <HW size={18} color={wfTokens.text}>{states[k]}</HW>
      <Mono color={wfTokens.textDim}>{count}</Mono>
      <div style={{ flex: 1 }} />
      <Ic d={I.plus} size={11} />
      <Ic d={I.more} size={11} />
    </div>
  );
}

// Section heading inside wireframes
function SecHead({ children, size = 14, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <HW size={size}>{children}</HW>
      {sub && <span style={{ marginLeft: 8 }}><Mono>{sub}</Mono></span>}
    </div>
  );
}

Object.assign(window, {
  wfTokens, WFTheme, useWF, stateColor,
  Page, HW, Mono, SB, L, Lines, Stripe, Pill, Dot, StateDot, StatePill, Prio, Tag, Btn, Check, Ic, I,
  TopBar, Sidebar, PageTitle, TaskCard, ColHead, SecHead,
});
