import { useWF } from '../../contexts/ThemeContext.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { wfTokens, stateColor } from '../../constants/tokens.js';
import { I } from '../../constants/icons.js';
import { HW, Mono, SB, Pill, Dot, StateDot, StatePill, Prio, Tag, Btn, Check, Ic } from '../primitives/index.jsx';

export function TopBar() {
  const { accent } = useWF();
  const { page, navigate, openCreateTask, setShowSearch } = useApp();
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  const tabs = [
    ['dashboard', 'Inicio'],
    ['projects', 'Proyectos'],
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px',
      height: 44, borderBottom: `1px solid ${wfTokens.borderSoft}`,
      background: wfTokens.surfaceLo, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('dashboard')}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: `linear-gradient(135deg, ${accent}, color-mix(in oklch, ${accent} 50%, ${wfTokens.bg}))` }} />
        <HW size={17}>tareas</HW>
      </div>

      <div style={{ display: 'flex', gap: 2, marginLeft: 14 }}>
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => navigate(k)} style={{
            padding: '6px 11px', borderRadius: 5, cursor: 'pointer',
            background: page === k ? wfTokens.surfaceHi : 'transparent',
            color: page === k ? wfTokens.text : wfTokens.textMuted,
            fontSize: 11, border: page === k ? `1px solid ${wfTokens.border}` : '1px solid transparent',
            fontFamily: 'inherit',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div onClick={() => setShowSearch(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surface, width: 220, color: wfTokens.textDim, cursor: 'pointer' }}>
        <Ic d={I.search} />
        <Mono>buscar...</Mono>
        <div style={{ flex: 1 }} />
        <Mono color={wfTokens.textDim}>⌘K</Mono>
      </div>

      <button onClick={() => openCreateTask()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 4 }} title="Nueva tarea (⌘N)">
        <Ic d={I.plus} size={15} c={wfTokens.textMuted} />
      </button>
      <Ic d={I.bell} size={14} />
      <button onClick={() => navigate('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
        <Ic d={I.cog} size={14} />
      </button>
      <div
        onClick={() => navigate('settings')}
        title={user?.name}
        style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--wf-accent)', border: `1px solid ${wfTokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, color: wfTokens.bg, fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0 }}>{initials}</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { accent } = useWF();
  const { page, navigate, selectedProject, setSelectedProject, projects, setShowCreateProject } = useApp();
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  const navItems = [
    ['dashboard', 'Inicio', I.grid],
    ['board', 'Tablero', I.grid],
    ['list', 'Lista', I.list],
    ['calendar', 'Calendario', I.cal],
  ];

  return (
    <div style={{
      width: 196, flexShrink: 0, borderRight: `1px solid ${wfTokens.borderSoft}`,
      background: wfTokens.surfaceLo, padding: '14px 10px',
      display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
    }}>
      {/* Navigation */}
      <div>
        <Mono color={wfTokens.textDim} size={9}>VISTAS</Mono>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
          {navItems.map(([k, label, icon]) => (
            <button key={k} onClick={() => navigate(k)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
              borderRadius: 4, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              background: page === k ? wfTokens.surfaceHi : 'transparent',
              color: page === k ? wfTokens.text : wfTokens.textMuted,
              fontFamily: 'inherit',
            }}>
              <Ic d={icon} size={11} c={page === k ? accent : wfTokens.textMuted} />
              <span style={{ fontSize: 11 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Mono color={wfTokens.textDim} size={9}>PROYECTOS</Mono>
          <button onClick={() => setShowCreateProject(true)} title="Nuevo proyecto" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', borderRadius: 3 }}>
            <Ic d={I.plus} size={10} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
          {/* All tasks item */}
          <button onClick={() => setSelectedProject(null)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
            borderRadius: 4, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
            background: selectedProject === null ? wfTokens.surfaceHi : 'transparent',
            color: selectedProject === null ? wfTokens.text : wfTokens.textMuted,
            fontFamily: 'inherit',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 1, border: `1px solid ${wfTokens.border}`, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 11 }}>Todas las tareas</span>
          </button>

          {/* Project items */}
          {projects.map(({ id, name, color }) => (
            <button key={id} onClick={() => setSelectedProject(id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              borderRadius: 4, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              background: selectedProject === id ? wfTokens.surfaceHi : 'transparent',
              color: selectedProject === id ? wfTokens.text : wfTokens.textMuted,
              fontFamily: 'inherit',
            }}>
              <Dot c={color} size={6} />
              <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin link (admins only) */}
      {user?.role === 'admin' && (
        <button onClick={() => navigate('admin')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
          borderRadius: 4, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
          background: page === 'admin' ? wfTokens.surfaceHi : 'transparent',
          color: page === 'admin' ? 'var(--wf-accent)' : wfTokens.textDim, fontFamily: 'inherit',
        }}>
          <Ic d={I.shield} size={11} c={page === 'admin' ? 'var(--wf-accent)' : wfTokens.textDim} />
          <span style={{ fontSize: 11 }}>Administración</span>
        </button>
      )}

      {/* User + Settings + Logout */}
      <div style={{ borderTop: `1px solid ${wfTokens.borderSoft}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => navigate('settings')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
          background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
          borderRadius: 4, color: wfTokens.textMuted, fontFamily: 'inherit',
        }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--wf-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: wfTokens.bg, fontFamily: '"JetBrains Mono", monospace' }}>{initials}</span>
          </div>
          <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{user?.name}</span>
          <Ic d={I.cog} size={10} c={wfTokens.textDim} />
        </button>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
          background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
          borderRadius: 4, color: wfTokens.textDim, fontFamily: 'inherit',
        }}>
          <Ic d={I.arrow} size={10} c={wfTokens.textDim} />
          <span style={{ fontSize: 10 }}>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

export function PageTitle({ children, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px 22px 10px', flexShrink: 0 }}>
      <div>
        <HW size={28}>{children}</HW>
        {sub && <div style={{ marginTop: 3 }}><Mono>{sub}</Mono></div>}
      </div>
      {right}
    </div>
  );
}

export function TaskCard({ title, prio, due, tags = [], subs, comments, state, dense, style, onClick }) {
  const { accent } = useWF();
  return (
    <SB hi onClick={onClick} style={{
      padding: dense ? 8 : 10, display: 'flex', flexDirection: 'column', gap: dense ? 5 : 7,
      borderLeft: state ? `2px solid ${stateColor(state)}` : `1px solid ${wfTokens.border}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.1s',
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
            <div style={{ height: '100%', width: `${(subs[0] / subs[1]) * 100}%`, background: accent, transition: 'width 0.2s' }} />
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
        {due && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: wfTokens.textMuted, fontSize: 9 }}><Ic d={I.cal} size={10} /> {due}</span>}
        <div style={{ flex: 1 }} />
        {comments != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: wfTokens.textDim, fontSize: 9 }}><Ic d={I.comment} size={10} /> {comments}</span>}
      </div>
    </SB>
  );
}

export function ColHead({ k, count }) {
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

export function SecHead({ children, size = 14, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <HW size={size}>{children}</HW>
      {sub && <span style={{ marginLeft: 8 }}><Mono>{sub}</Mono></span>}
    </div>
  );
}
