import { useState } from 'react';
import { wfTokens } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { HW, Mono, SB, Btn, Check, Ic, StateDot } from '../components/primitives/index.jsx';
import { PageTitle, SecHead } from '../components/chrome/index.jsx';

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

function Input({ value }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.text }}>
      {value}
    </div>
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
          {activeSection === 'perfil' && (
            <>
              <SecHead size={20} sub="cómo te muestras">Perfil</SecHead>
              <SB style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: wfTokens.text, fontWeight: 500 }}>tu nombre</div>
                  <Mono>tu@email.com</Mono>
                </div>
                <Btn ghost>Cambiar foto</Btn>
              </SB>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Nombre"><Input value="tu nombre" /></Field>
                <Field label="Email"><Input value="tu@email.com" /></Field>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn primary>Guardar cambios</Btn>
                <Btn ghost>Cancelar</Btn>
              </div>
            </>
          )}

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
                    <Input value={v} />
                  </Field>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn primary>Guardar</Btn>
                <Btn ghost>Restablecer</Btn>
              </div>
            </>
          )}

          {!['perfil', 'apariencia', 'estados'].includes(activeSection) && (
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
