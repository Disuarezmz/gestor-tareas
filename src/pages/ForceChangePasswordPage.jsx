import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { wfTokens } from '../constants/tokens.js';
import { HW, Mono } from '../components/primitives/index.jsx';

function Field({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="••••••"
        style={{
          padding: '9px 12px', borderRadius: 5,
          border: `1px solid ${focused ? 'var(--wf-accent)' : wfTokens.border}`,
          background: wfTokens.surfaceLo, color: wfTokens.text,
          fontSize: 12, fontFamily: 'inherit', outline: 'none',
          width: '100%', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />
    </div>
  );
}

export default function ForceChangePasswordPage() {
  const { forceChangePassword, logout, user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      await forceChangePassword(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: wfTokens.bg, padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, var(--wf-accent), oklch(55% 0.1 210))' }} />
          <HW size={22}>tareas</HW>
        </div>

        <div style={{
          background: wfTokens.surface, border: `1px solid ${wfTokens.border}`,
          borderRadius: 10, padding: 28,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: wfTokens.text, marginBottom: 4 }}>
              Cambia tu contraseña
            </div>
            <Mono>Hola {user?.name}. El administrador requiere que establezcas una contraseña propia antes de continuar.</Mono>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nueva contraseña" value={password} onChange={setPassword} />
            <Field label="Confirmar contraseña" value={confirm} onChange={setConfirm} />

            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 5,
                background: 'oklch(18% 0.04 25)', border: '1px solid oklch(35% 0.1 25)',
                color: 'oklch(72% 0.16 25)', fontSize: 11,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 2, padding: '10px', borderRadius: 5, border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                background: 'var(--wf-accent)', color: wfTokens.bg,
                fontWeight: 600, fontSize: 12, fontFamily: 'inherit',
                opacity: loading ? 0.65 : 1, transition: 'opacity 0.15s',
              }}
            >
              {loading ? '…' : 'Establecer contraseña'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Mono>
            <span
              onClick={logout}
              style={{ color: wfTokens.textMuted, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cerrar sesión
            </span>
          </Mono>
        </div>
      </div>
    </div>
  );
}
