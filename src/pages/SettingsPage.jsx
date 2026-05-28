import { useState } from 'react';
import { wfTokens } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { HW, Mono, SB, Btn, Check, Ic, StateDot } from '../components/primitives/index.jsx';
import { PageTitle, SecHead } from '../components/chrome/index.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const NAV = [
  ['perfil', 'Perfil', 'user'],
  ['cuenta', 'Cuenta', 'cog'],
  ['apariencia', 'Apariencia', 'grid'],
  ['estados', 'Estados de tareas', 'flag'],
  ['notificaciones', 'Notificaciones', 'bell'],
  ['atajos', 'Atajos de teclado', 'arrow'],
  ['datos', 'Datos e importar', 'folder'],
];

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: '8px 12px', borderRadius: 5,
        border: `1px solid ${focused ? 'var(--wf-accent)' : wfTokens.border}`,
        background: wfTokens.surfaceLo, color: wfTokens.text,
        fontSize: 11, fontFamily: 'inherit', outline: 'none',
        width: '100%', boxSizing: 'border-box', transition: 'border-color 0.15s',
      }}
    />
  );
}

function Select({ value }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {value}
      <Ic d={I.chev} size={10} />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
      <span style={{ flex: 1, fontSize: 11, color: wfTokens.text }}>{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{ width: 30, height: 16, borderRadius: 999, background: on ? 'var(--wf-accent)' : wfTokens.border, position: 'relative', flexShrink: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 12, height: 12, borderRadius: 999, background: '#0e0e14', transition: 'left 0.15s' }} />
    </div>
  );
}

function Tabs({ options, active }) {
  return (
    <div style={{ display: 'flex', borderRadius: 5, border: `1px solid ${wfTokens.border}`, overflow: 'hidden' }}>
      {options.map((o, i) => (
        <div key={i} style={{
          padding: '5px 10px', fontSize: 10,
          background: i === active ? wfTokens.surfaceHi : 'transparent',
          color: i === active ? wfTokens.text : wfTokens.textMuted,
          borderRight: i < options.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
          cursor: 'pointer',
        }}>{o}</div>
      ))}
    </div>
  );
}

function StatusMsg({ type, text }) {
  if (!text) return null;
  const isErr = type === 'error';
  return (
    <div style={{
      padding: '7px 12px', borderRadius: 5, fontSize: 11,
      background: isErr ? 'oklch(18% 0.04 25)' : 'oklch(18% 0.04 150)',
      border: `1px solid ${isErr ? 'oklch(35% 0.1 25)' : 'oklch(35% 0.1 150)'}`,
      color: isErr ? 'oklch(72% 0.16 25)' : 'oklch(70% 0.09 150)',
    }}>
      {text}
    </div>
  );
}

function PerfilSection() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState(null); // {type, text}
  const [saving, setSaving] = useState(false);
  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await updateProfile({ name, email });
      setStatus({ type: 'ok', text: 'Cambios guardados' });
    } catch (e) {
      setStatus({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SecHead size={20} sub="cómo te muestras">Perfil</SecHead>
      <SB style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--wf-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: wfTokens.bg, fontFamily: '"JetBrains Mono", monospace' }}>{initials}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: wfTokens.text, fontWeight: 500 }}>{user?.name}</div>
          <Mono>{user?.email}</Mono>
        </div>
      </SB>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Nombre">
          <TextInput value={name} onChange={setName} placeholder="Tu nombre" />
        </Field>
        <Field label="Email">
          <TextInput value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
        </Field>
        <Field label="Zona horaria"><Select value="Europe/Madrid · UTC+2" /></Field>
        <Field label="Idioma"><Select value="Español" /></Field>
      </div>
      <div style={{ paddingTop: 4, borderTop: `1px solid ${wfTokens.borderSoft}` }}>
        <SecHead size={16} sub="cuándo empieza tu semana">Preferencias</SecHead>
        <SB style={{ padding: 14, marginTop: 10 }}>
          <Row label="Primer día de la semana"><Tabs options={['Lunes', 'Domingo', 'Sábado']} active={0} /></Row>
          <Row label="Formato 24h"><Toggle on /></Row>
          <Row label="Vista por defecto"><Select value="Tablero" /></Row>
        </SB>
      </div>
      {status && <StatusMsg type={status.type} text={status.text} />}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '7px 14px', borderRadius: 5, border: 'none', cursor: saving ? 'wait' : 'pointer',
            background: 'var(--wf-accent)', color: wfTokens.bg, fontWeight: 600, fontSize: 11,
            fontFamily: 'inherit', opacity: saving ? 0.65 : 1,
          }}
        >
          {saving ? '…' : 'Guardar cambios'}
        </button>
        <Btn ghost onClick={() => { setName(user?.name ?? ''); setEmail(user?.email ?? ''); setStatus(null); }}>
          Cancelar
        </Btn>
      </div>
    </>
  );
}

function CuentaSection() {
  const { changePassword, deleteAccount, logout } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwStatus, setPwStatus] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  const savePassword = async () => {
    if (next !== confirm) return setPwStatus({ type: 'error', text: 'Las contraseñas no coinciden' });
    setPwSaving(true);
    setPwStatus(null);
    try {
      await changePassword(current, next);
      setPwStatus({ type: 'ok', text: 'Contraseña actualizada' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch (e) {
      setPwStatus({ type: 'error', text: e.message });
    } finally {
      setPwSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'ELIMINAR') return setDeleteStatus({ type: 'error', text: 'Escribe ELIMINAR para confirmar' });
    setDeleting(true);
    try {
      await deleteAccount();
    } catch (e) {
      setDeleteStatus({ type: 'error', text: e.message });
      setDeleting(false);
    }
  };

  return (
    <>
      <SecHead size={20} sub="seguridad y datos">Cuenta</SecHead>

      {/* Change password */}
      <SB style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SecHead size={14}>Cambiar contraseña</SecHead>
        <Field label="Contraseña actual">
          <TextInput type="password" value={current} onChange={setCurrent} placeholder="••••••" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Nueva contraseña">
            <TextInput type="password" value={next} onChange={setNext} placeholder="••••••" />
          </Field>
          <Field label="Confirmar contraseña">
            <TextInput type="password" value={confirm} onChange={setConfirm} placeholder="••••••" />
          </Field>
        </div>
        {pwStatus && <StatusMsg type={pwStatus.type} text={pwStatus.text} />}
        <div>
          <button
            onClick={savePassword}
            disabled={pwSaving}
            style={{
              padding: '7px 14px', borderRadius: 5, border: 'none', cursor: pwSaving ? 'wait' : 'pointer',
              background: 'var(--wf-accent)', color: wfTokens.bg, fontWeight: 600, fontSize: 11,
              fontFamily: 'inherit', opacity: pwSaving ? 0.65 : 1,
            }}
          >
            {pwSaving ? '…' : 'Actualizar contraseña'}
          </button>
        </div>
      </SB>

      {/* Danger zone */}
      <SB style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, borderColor: 'oklch(35% 0.1 25)' }}>
        <div>
          <SecHead size={14}>Zona de peligro</SecHead>
          <Mono style={{ marginTop: 4 }}>Esta acción eliminará tu cuenta y todos tus datos de forma permanente.</Mono>
        </div>
        <Field label="Escribe ELIMINAR para confirmar">
          <TextInput value={deleteConfirm} onChange={setDeleteConfirm} placeholder="ELIMINAR" />
        </Field>
        {deleteStatus && <StatusMsg type={deleteStatus.type} text={deleteStatus.text} />}
        <div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '7px 14px', borderRadius: 5,
              border: '1px solid oklch(35% 0.1 25)',
              cursor: deleting ? 'wait' : 'pointer',
              background: 'oklch(18% 0.04 25)', color: 'oklch(72% 0.16 25)',
              fontWeight: 600, fontSize: 11, fontFamily: 'inherit',
              opacity: deleting ? 0.65 : 1,
            }}
          >
            {deleting ? '…' : 'Eliminar cuenta'}
          </button>
        </div>
      </SB>
    </>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('perfil');

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle sub="ajustes personales">Configuración</PageTitle>

      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '200px 1fr', borderTop: `1px solid ${wfTokens.borderSoft}` }}>
        {/* Inner sidebar */}
        <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(([k, label, icon]) => (
            <button key={k} onClick={() => setActiveSection(k)} style={{
              padding: '8px 10px', borderRadius: 5, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
              background: activeSection === k ? wfTokens.surfaceHi : 'transparent',
              color: activeSection === k ? wfTokens.text : wfTokens.textMuted, fontSize: 11,
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}>
              <Ic d={I[icon]} size={12} c={activeSection === k ? wfTokens.text : wfTokens.textMuted} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeSection === 'perfil' && <PerfilSection />}

          {activeSection === 'cuenta' && <CuentaSection />}

          {activeSection === 'apariencia' && (
            <>
              <SecHead size={20} sub="tema y colores">Apariencia</SecHead>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[['Oscuro', true, 0], ['Claro', false, 1], ['Sistema', false, 2]].map(([n, active, idx]) => (
                  <SB key={n} style={{ padding: 14, borderColor: active ? 'var(--wf-accent)' : wfTokens.border, cursor: 'pointer' }}>
                    <div style={{ height: 60, borderRadius: 4, marginBottom: 10, border: `1px solid ${wfTokens.borderSoft}`, background: idx === 0 ? wfTokens.bg : idx === 1 ? '#f5f5f8' : `linear-gradient(90deg, ${wfTokens.bg} 50%, #f5f5f8 50%)` }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check done={active} size={11} />
                      <span style={{ fontSize: 11, color: wfTokens.text }}>{n}</span>
                    </div>
                  </SB>
                ))}
              </div>
              <SB style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
                <Row label="Color de acento">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['oklch(72% 0.13 285)', 'oklch(75% 0.13 210)', 'oklch(78% 0.13 145)', 'oklch(76% 0.13 60)', 'oklch(70% 0.15 25)'].map((c, i) => (
                      <div key={i} style={{ width: 22, height: 22, borderRadius: 999, background: c, border: i === 1 ? `2px solid ${wfTokens.text}` : `1px solid ${wfTokens.border}`, cursor: 'pointer', outline: i === 1 ? '2px solid var(--wf-accent)' : 'none', outlineOffset: 1 }} />
                    ))}
                  </div>
                </Row>
                <Row label="Tipografía"><Tabs options={['Sistema', 'Inter', 'Mono']} active={1} /></Row>
                <Row label="Densidad"><Tabs options={['Cómoda', 'Estándar', 'Compacta']} active={1} /></Row>
                <Row label="Animaciones reducidas"><Toggle /></Row>
                <Row label="Esquinas redondeadas" style={{ borderBottom: 'none' }}><Toggle on /></Row>
              </SB>
            </>
          )}

          {activeSection === 'estados' && (
            <>
              <SecHead size={20} sub="personaliza los nombres de cada estado">Estados de tareas</SecHead>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {[['new', 'Nueva'], ['wait', 'En espera'], ['exec', 'En ejecución'], ['done', 'Finalizada']].map(([k, v]) => (
                  <Field key={k} label={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StateDot k={k} size={7} />
                      <span>{k.toUpperCase()}</span>
                    </div>
                  }>
                    <TextInput value={v} onChange={() => {}} />
                  </Field>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn primary>Guardar</Btn>
                <Btn ghost>Restablecer</Btn>
              </div>
            </>
          )}

          {!['perfil', 'cuenta', 'apariencia', 'estados'].includes(activeSection) && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: wfTokens.textDim }}>
              <Ic d={I.cog} size={32} />
              <Mono size={11}>{NAV.find(([k]) => k === activeSection)?.[1]} · próximamente</Mono>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
