import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { wfTokens } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { HW, Mono, SB, Pill, Dot, Ic } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';

// ── API helper ────────────────────────────────────────────────

async function adminApi(path, options = {}) {
  const res = await fetch('/api/admin' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

// ── Shared UI helpers ─────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  return (
    <SB style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || wfTokens.text, lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>
        {value ?? '—'}
      </div>
      {sub && <Mono>{sub}</Mono>}
    </SB>
  );
}

function Avatar({ name, color, size = 28 }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: color || 'var(--wf-accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: Math.floor(size * 0.35), fontWeight: 700, color: wfTokens.bg, fontFamily: '"JetBrains Mono", monospace' }}>
        {initials}
      </span>
    </div>
  );
}

function RoleBadge({ role }) {
  return role === 'admin'
    ? <Pill c="var(--wf-accent)" fill><Ic d={I.shield} size={8} c="var(--wf-accent)" /> admin</Pill>
    : <Pill c={wfTokens.textDim}>usuario</Pill>;
}

function StatusBadge({ isActive }) {
  return isActive
    ? <Pill c={wfTokens.hueDone} fill>activo</Pill>
    : <Pill c={wfTokens.hueHigh} fill>suspendido</Pill>;
}

function ActionBtn({ icon, label, onClick, danger, disabled, title }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title || label}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 8px', borderRadius: 4, border: `1px solid ${danger ? 'oklch(35% 0.1 25)' : wfTokens.border}`,
        background: danger ? 'oklch(18% 0.04 25)' : wfTokens.surfaceLo,
        color: danger ? 'oklch(72% 0.16 25)' : wfTokens.textMuted,
        fontSize: 9, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1, transition: 'opacity 0.1s',
      }}
    >
      <Ic d={I[icon]} size={10} c={danger ? 'oklch(72% 0.16 25)' : wfTokens.textMuted} />
      {label}
    </button>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: active ? wfTokens.surfaceHi : 'transparent',
      color: active ? wfTokens.text : wfTokens.textMuted,
      fontSize: 11, borderBottom: active ? '2px solid var(--wf-accent)' : '2px solid transparent',
      transition: 'color 0.1s',
    }}>
      {children}
    </button>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        padding: '7px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'inherit',
        border: `1px solid ${focused ? 'var(--wf-accent)' : wfTokens.border}`,
        background: wfTokens.surfaceLo, color: wfTokens.text, outline: 'none',
        width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
      }}
    />
  );
}

function ErrMsg({ text }) {
  if (!text) return null;
  return (
    <div style={{ padding: '6px 10px', borderRadius: 4, fontSize: 10, background: 'oklch(18% 0.04 25)', border: '1px solid oklch(35% 0.1 25)', color: 'oklch(72% 0.16 25)' }}>
      {text}
    </div>
  );
}

function OkMsg({ text }) {
  if (!text) return null;
  return (
    <div style={{ padding: '6px 10px', borderRadius: 4, fontSize: 10, background: 'oklch(18% 0.04 150)', border: '1px solid oklch(35% 0.1 150)', color: 'oklch(70% 0.09 150)' }}>
      {text}
    </div>
  );
}

// ── Tab: Resumen ──────────────────────────────────────────────

function ResumenTab() {
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([adminApi('/stats'), adminApi('/audit')])
      .then(([s, a]) => { setStats(s); setAudit(a.slice(0, 6)); })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBox />;
  if (err) return <ErrMsg text={err} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard label="Usuarios totales" value={stats.totalUsers} sub={`${stats.admins} admin · ${stats.totalUsers - stats.admins} usuarios`} />
        <StatCard label="Nuevos esta semana" value={stats.newWeek} color="var(--wf-accent)" />
        <StatCard label="Suspendidos" value={stats.suspended} color={stats.suspended > 0 ? wfTokens.hueHigh : wfTokens.textDim} />
        <StatCard label="Tareas / Proyectos" value={`${stats.totalTasks} / ${stats.totalProjects}`} sub="en total" />
      </div>

      <div>
        <div style={{ marginBottom: 10 }}><Mono size={9}>ACTIVIDAD RECIENTE</Mono></div>
        <SB style={{ overflow: 'hidden' }}>
          {audit.length === 0 && (
            <div style={{ padding: 16 }}><Mono>Sin actividad registrada</Mono></div>
          )}
          {audit.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
              borderBottom: i < audit.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
            }}>
              <Mono style={{ minWidth: 110 }}>{fmtDate(e.createdAt)}</Mono>
              <span style={{ fontSize: 11, color: wfTokens.textMuted, minWidth: 100 }}>{e.actorName}</span>
              <ActionLabel action={e.action} />
              {e.targetName && <span style={{ fontSize: 10, color: wfTokens.textDim }}>→ {e.targetName}</span>}
            </div>
          ))}
        </SB>
      </div>
    </div>
  );
}

// ── Tab: Usuarios ─────────────────────────────────────────────

function UsuariosTab() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [rowErr, setRowErr] = useState({});

  const [showCreate, setShowCreate] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi('/users')
      .then(setUsers)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const setRowError = (id, msg) => setRowErr((prev) => ({ ...prev, [id]: msg }));

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const updated = await adminApi(`/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, ...updated } : x));
      setRowError(u.id, '');
    } catch (e) { setRowError(u.id, e.message); }
  };

  const toggleActive = async (u) => {
    try {
      const updated = await adminApi(`/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !u.isActive }) });
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, ...updated } : x));
      setRowError(u.id, '');
    } catch (e) { setRowError(u.id, e.message); }
  };

  const deleteUser = async (u) => {
    if (!confirm(`¿Eliminar a ${u.name}? Se borrarán todas sus tareas y proyectos.`)) return;
    try {
      await adminApi(`/users/${u.id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) { setRowError(u.id, e.message); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <LoadingBox />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <TextInput value={search} onChange={setSearch} placeholder="Buscar por nombre o email…" />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 5, border: 'none', cursor: 'pointer',
            background: 'var(--wf-accent)', color: wfTokens.bg, fontSize: 11, fontFamily: 'inherit', fontWeight: 600,
          }}
        >
          <Ic d={I.plus} size={11} c={wfTokens.bg} /> Nuevo usuario
        </button>
      </div>

      {err && <ErrMsg text={err} />}

      <SB style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 80px 90px 60px 60px 90px 110px',
          padding: '6px 14px', borderBottom: `1px solid ${wfTokens.border}`,
          background: wfTokens.surfaceLo,
        }}>
          {['Usuario', 'Email', 'Rol', 'Estado', 'Tareas', 'Proyt.', 'Registrado', 'Acciones'].map((h) => (
            <Mono key={h} size={8}>{h.toUpperCase()}</Mono>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 20 }}><Mono>Sin resultados</Mono></div>
        )}

        {filtered.map((u) => {
          const isSelf = u.id === me.id;
          return (
            <div key={u.id} style={{ borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 80px 90px 60px 60px 90px 110px',
                padding: '10px 14px', alignItems: 'center',
                background: isSelf ? `color-mix(in oklch, var(--wf-accent) 5%, transparent)` : 'transparent',
              }}>
                {/* Usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Avatar name={u.name} color={u.avatarColor} size={26} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: wfTokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name} {isSelf && <Mono size={8}>(tú)</Mono>}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <Mono style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {u.email}
                </Mono>

                {/* Rol */}
                <div><RoleBadge role={u.role} /></div>

                {/* Estado */}
                <div><StatusBadge isActive={u.isActive} /></div>

                {/* Tareas */}
                <Mono>{u.taskCount}</Mono>

                {/* Proyectos */}
                <Mono>{u.projectCount}</Mono>

                {/* Registrado */}
                <Mono>{fmtDateShort(u.createdAt)}</Mono>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <ActionBtn
                    icon={u.role === 'admin' ? 'user' : 'shield'}
                    label={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    onClick={() => toggleRole(u)}
                    disabled={isSelf}
                    title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                  />
                  <ActionBtn
                    icon={u.isActive ? 'ban' : 'check'}
                    label={u.isActive ? 'Suspender' : 'Activar'}
                    onClick={() => toggleActive(u)}
                    disabled={isSelf}
                    danger={u.isActive}
                    title={isSelf ? 'No puedes suspender tu propia cuenta' : undefined}
                  />
                  <ActionBtn
                    icon="x"
                    label="Eliminar"
                    onClick={() => deleteUser(u)}
                    disabled={isSelf}
                    danger
                    title={isSelf ? 'Usa Configuración para eliminar tu cuenta' : undefined}
                  />
                </div>
              </div>
              {rowErr[u.id] && (
                <div style={{ padding: '0 14px 8px' }}>
                  <ErrMsg text={rowErr[u.id]} />
                </div>
              )}
            </div>
          );
        })}
      </SB>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => { setUsers((prev) => [...prev, u]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ── Create User Modal ─────────────────────────────────────────

function CreateUserModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const u = await adminApi('/users', { method: 'POST', body: JSON.stringify({ name, email, password, role }) });
      onCreated(u);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 380, background: wfTokens.surface, border: `1px solid ${wfTokens.border}`, borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: wfTokens.text }}>Nuevo usuario</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <Ic d={I.x} size={14} c={wfTokens.textMuted} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FieldRow label="Nombre">
            <TextInput value={name} onChange={setName} placeholder="Nombre completo" />
          </FieldRow>
          <FieldRow label="Email">
            <TextInput value={email} onChange={setEmail} placeholder="correo@empresa.com" type="email" />
          </FieldRow>
          <FieldRow label="Contraseña">
            <TextInput value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" type="password" />
          </FieldRow>
          <FieldRow label="Rol">
            <div style={{ display: 'flex', gap: 8 }}>
              {['user', 'admin'].map((r) => (
                <button
                  key={r} type="button" onClick={() => setRole(r)}
                  style={{
                    padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 10, border: `1px solid ${role === r ? 'var(--wf-accent)' : wfTokens.border}`,
                    background: role === r ? 'color-mix(in oklch, var(--wf-accent) 15%, transparent)' : 'transparent',
                    color: role === r ? 'var(--wf-accent)' : wfTokens.textMuted,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </FieldRow>

          {err && <ErrMsg text={err} />}

          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button
              type="submit" disabled={saving}
              style={{
                flex: 1, padding: '8px', borderRadius: 5, border: 'none', cursor: saving ? 'wait' : 'pointer',
                background: 'var(--wf-accent)', color: wfTokens.bg, fontWeight: 600, fontSize: 11, fontFamily: 'inherit',
                opacity: saving ? 0.65 : 1,
              }}
            >
              {saving ? '…' : 'Crear usuario'}
            </button>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 5, cursor: 'pointer', border: `1px solid ${wfTokens.border}`,
                background: 'transparent', color: wfTokens.textMuted, fontSize: 11, fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      {children}
    </div>
  );
}

// ── Tab: Actividad ────────────────────────────────────────────

function ActividadTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminApi('/audit')
      .then(setLogs)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBox />;
  if (err) return <ErrMsg text={err} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Mono size={9}>REGISTRO DE AUDITORÍA · ÚLTIMAS {logs.length} ENTRADAS</Mono>
        <button
          onClick={() => { setLoading(true); adminApi('/audit').then(setLogs).catch((e) => setErr(e.message)).finally(() => setLoading(false)); }}
          style={{ background: 'none', border: `1px solid ${wfTokens.border}`, borderRadius: 4, cursor: 'pointer', padding: '3px 8px', color: wfTokens.textMuted, fontSize: 10, fontFamily: 'inherit' }}
        >
          Actualizar
        </button>
      </div>

      <SB style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '120px 130px 180px 130px 1fr',
          padding: '6px 14px', borderBottom: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo,
        }}>
          {['Fecha', 'Administrador', 'Acción', 'Usuario afectado', 'Detalles'].map((h) => (
            <Mono key={h} size={8}>{h.toUpperCase()}</Mono>
          ))}
        </div>

        {logs.length === 0 && (
          <div style={{ padding: 20 }}><Mono>Sin actividad registrada</Mono></div>
        )}

        {logs.map((e, i) => (
          <div key={e.id} style={{
            display: 'grid', gridTemplateColumns: '120px 130px 180px 130px 1fr',
            padding: '9px 14px', alignItems: 'center',
            borderBottom: i < logs.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
          }}>
            <Mono>{fmtDate(e.createdAt)}</Mono>
            <span style={{ fontSize: 11, color: wfTokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.actorName}</span>
            <ActionLabel action={e.action} />
            <span style={{ fontSize: 10, color: wfTokens.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.targetName || '—'}</span>
            <Mono style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.meta ? JSON.stringify(e.meta) : '—'}
            </Mono>
          </div>
        ))}
      </SB>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────

const ACTION_LABELS = {
  'user.create':      { label: 'Usuario creado',         color: wfTokens.hueDone },
  'user.update':      { label: 'Perfil actualizado',     color: wfTokens.textMuted },
  'user.suspend':     { label: 'Cuenta suspendida',      color: wfTokens.hueHigh },
  'user.activate':    { label: 'Cuenta activada',        color: wfTokens.hueDone },
  'user.delete':      { label: 'Usuario eliminado',      color: wfTokens.hueHigh },
  'role.set_admin':   { label: 'Rol → administrador',    color: 'var(--wf-accent)' },
  'role.set_user':    { label: 'Rol → usuario',          color: wfTokens.textMuted },
};

function ActionLabel({ action }) {
  const def = ACTION_LABELS[action] || { label: action, color: wfTokens.textDim };
  return (
    <span style={{ fontSize: 10, color: def.color, fontFamily: '"JetBrains Mono", monospace' }}>
      {def.label}
    </span>
  );
}

function LoadingBox() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Mono>Cargando…</Mono>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ── Main page ─────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('resumen');

  if (user?.role !== 'admin') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Ic d={I.shield} size={32} c={wfTokens.hueHigh} />
        <Mono size={11}>Acceso restringido · Se requieren permisos de administrador</Mono>
      </div>
    );
  }

  const tabs = [
    ['resumen', 'Resumen'],
    ['usuarios', 'Usuarios'],
    ['actividad', 'Actividad'],
  ];

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle sub="panel de control">Administración</PageTitle>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${wfTokens.borderSoft}`, paddingLeft: 22, flexShrink: 0 }}>
        {tabs.map(([k, label]) => (
          <TabBtn key={k} active={tab === k} onClick={() => setTab(k)}>{label}</TabBtn>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        {tab === 'resumen'   && <ResumenTab />}
        {tab === 'usuarios'  && <UsuariosTab />}
        {tab === 'actividad' && <ActividadTab />}
      </div>
    </div>
  );
}
