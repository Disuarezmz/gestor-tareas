import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { wfTokens } from '../constants/tokens.js';
import { HW, Mono } from '../components/primitives/index.jsx';

function Field({ label, type = 'text', value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      <div style={{
        borderRadius: 8,
        transition: 'box-shadow 0.22s',
        boxShadow: focused
          ? `0 0 0 2px color-mix(in oklch, var(--wf-accent) 35%, transparent), 0 0 16px color-mix(in oklch, var(--wf-accent) 12%, transparent)`
          : `0 0 0 1px ${wfTokens.border}`,
      }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            padding: '10px 13px', borderRadius: 8,
            border: 'none',
            background: focused
              ? `color-mix(in oklch, var(--wf-accent) 6%, ${wfTokens.surfaceLo})`
              : wfTokens.surfaceLo,
            color: wfTokens.text,
            fontSize: 12, fontFamily: 'inherit', outline: 'none',
            width: '100%', boxSizing: 'border-box',
            transition: 'background 0.22s',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: wfTokens.bg, padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', width: 480, height: 480, borderRadius: '50%',
        top: '-5%', left: '5%',
        background: 'radial-gradient(circle, color-mix(in oklch, var(--wf-accent) 11%, transparent) 0%, transparent 65%)',
        animation: 'wf-orb-drift 14s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 360, height: 360, borderRadius: '50%',
        bottom: '5%', right: '8%',
        background: 'radial-gradient(circle, color-mix(in oklch, var(--wf-accent) 8%, transparent) 0%, transparent 65%)',
        animation: 'wf-orb-drift-2 18s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        top: '55%', left: '70%',
        background: 'radial-gradient(circle, color-mix(in oklch, var(--wf-accent) 6%, transparent) 0%, transparent 65%)',
        animation: 'wf-orb-drift 20s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="wf-logo-pop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--wf-accent), oklch(55% 0.1 210))',
            boxShadow: '0 4px 16px color-mix(in oklch, var(--wf-accent) 40%, transparent)',
          }} />
          <HW size={22}>DisuTasks</HW>
        </div>

        {/* Card */}
        <div className="wf-auth-card" style={{
          background: `color-mix(in oklch, ${wfTokens.surface} 90%, transparent)`,
          border: `1px solid color-mix(in oklch, ${wfTokens.border} 80%, transparent)`,
          borderRadius: 14, padding: 30,
          display: 'flex', flexDirection: 'column', gap: 22,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: wfTokens.text, marginBottom: 5 }}>
              Iniciar sesión
            </div>
            <Mono>Accede a tus tareas y proyectos</Mono>
          </div>

          <div className="wf-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field
                label="Email" type="email"
                value={email} onChange={setEmail}
                placeholder="tu@email.com"
                autoFocus
              />
              <Field
                label="Contraseña" type="password"
                value={password} onChange={setPassword}
                placeholder="••••••"
              />

              {error && (
                <div style={{
                  padding: '9px 13px', borderRadius: 7,
                  background: 'oklch(18% 0.04 25)', border: '1px solid oklch(35% 0.1 25)',
                  color: 'oklch(72% 0.16 25)', fontSize: 11,
                  animation: 'wf-slide-up 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                  {error}
                </div>
              )}

              <SubmitButton loading={loading} />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        marginTop: 4, padding: '11px', borderRadius: 8, border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        background: 'var(--wf-accent)',
        color: '#0e0e14',
        fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
        opacity: loading ? 0.65 : 1,
        transform: pressed ? 'translateY(1px) scale(0.98)' : hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered && !loading
          ? '0 8px 24px color-mix(in oklch, var(--wf-accent) 50%, transparent)'
          : '0 2px 10px color-mix(in oklch, var(--wf-accent) 25%, transparent)',
        transition: 'opacity 0.15s, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s',
      }}
    >
      {loading ? '…' : 'Entrar'}
    </button>
  );
}
