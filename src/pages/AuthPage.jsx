import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { wfTokens } from '../constants/tokens.js';
import { HW, Mono } from '../components/primitives/index.jsx';

function Field({ label, type = 'text', value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: wfTokens.bg, padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, var(--wf-accent), oklch(55% 0.1 210))' }} />
          <HW size={22}>tareas</HW>
        </div>

        {/* Card */}
        <div style={{
          background: wfTokens.surface, border: `1px solid ${wfTokens.border}`,
          borderRadius: 10, padding: 28,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: wfTokens.text, marginBottom: 4 }}>
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </div>
            <Mono>
              {mode === 'login' ? 'Accede a tus tareas y proyectos' : 'Empieza a organizar tu trabajo'}
            </Mono>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" autoFocus />
            )}
            <Field
              label="Email" type="email"
              value={email} onChange={setEmail}
              placeholder="tu@email.com"
              autoFocus={mode === 'login'}
            />
            <Field
              label="Contraseña" type="password"
              value={password} onChange={setPassword}
              placeholder="••••••"
            />
            {mode === 'register' && (
              <Field
                label="Confirmar contraseña" type="password"
                value={confirm} onChange={setConfirm}
                placeholder="••••••"
              />
            )}

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
              {loading ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        {/* Switch */}
        <div style={{ textAlign: 'center' }}>
          <Mono>
            {mode === 'login' ? '¿Sin cuenta? ' : '¿Ya tienes cuenta? '}
            <span
              onClick={switchMode}
              style={{ color: 'var(--wf-accent)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </span>
          </Mono>
        </div>
      </div>
    </div>
  );
}
