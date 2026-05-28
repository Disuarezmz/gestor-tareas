import { wfTokens, stateColor } from '../../../constants/tokens.js';
import { I } from '../../../constants/icons.js';
import { Page, HW, Mono, SB, Dot, StateDot, Pill, Btn, Check, Ic } from '../../primitives/index.jsx';
import { TopBar, Sidebar, PageTitle, SecHead } from '../../chrome/index.jsx';

const PROJECTS = [
  ['Rediseño app', wfTokens.hueExec, 8, 14, 'activo', 'hoy', 'Diseño y rediseño de la app iOS, foco en onboarding y home.'],
  ['Marketing Q3', wfTokens.hueWait, 3, 9, 'activo', 'mañana', 'Campaña, landing, copy y demo para clientes.'],
  ['Backend v2', wfTokens.hueNew, 5, 11, 'activo', '03 jun', 'Migración a Postgres 16 + nuevo auth.'],
  ['Personal', wfTokens.hueDone, 2, 4, 'activo', '—', 'Cosas mías: dominios, ideas, etc.'],
  ['Ideas', 'oklch(70% 0.05 280)', 0, 7, 'pausa', '—', 'Cajón de ideas sin asignar a proyecto.'],
  ['Beta cerrada', 'oklch(60% 0.05 30)', 0, 23, 'archivado', '—', 'Programa de beta cerrada — completado.'],
];

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <span style={{ flex: 1, fontSize: 11, color: wfTokens.text }}>{label}</span>
      {children}
    </div>
  );
}

function Switch({ on }) {
  return (
    <div style={{
      width: 30, height: 16, borderRadius: 999,
      background: on ? 'var(--wf-accent)' : wfTokens.border,
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 12, height: 12, borderRadius: 999, background: '#0e0e14',
      }} />
    </div>
  );
}

function Toggle3({ options, active }) {
  return (
    <div style={{ display: 'flex', borderRadius: 5, border: `1px solid ${wfTokens.border}`, overflow: 'hidden' }}>
      {options.map((o, i) => (
        <div key={i} style={{
          padding: '5px 10px', fontSize: 10,
          background: i === active ? wfTokens.surfaceHi : 'transparent',
          color: i === active ? wfTokens.text : wfTokens.textMuted,
          borderRight: i < options.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
        }}>{o}</div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Mono size={9}>{label.toUpperCase()}</Mono>
      {children}
    </div>
  );
}

function SelectField({ value }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 5,
      border: `1px solid ${wfTokens.border}`,
      background: wfTokens.surfaceLo,
      fontSize: 11, color: wfTokens.text,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {value}
      <Ic d={I.chev} size={9} />
    </div>
  );
}

export function ProjectsA() {
  return (
    <Page>
      <TopBar active="projects" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="4 activos · 1 en pausa · 1 archivado" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>orden: actividad</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> nuevo proyecto</Btn>
            </div>
          }>Proyectos</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, gridAutoRows: 'min-content' }}>
            {PROJECTS.map(([n, c, done, total, status, due, desc], i) => (
              <SB key={i} style={{
                padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                borderTop: `3px solid ${c}`, position: 'relative',
                opacity: status === 'archivado' ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HW size={20}>{n}</HW>
                  <div style={{ flex: 1 }} />
                  {status !== 'activo' && <Pill c={wfTokens.textDim}>{status}</Pill>}
                  <Ic d={I.star} size={11} />
                </div>
                <div style={{ fontSize: 10, color: wfTokens.textMuted, minHeight: 28 }}>{desc}</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Mono>progreso</Mono>
                    <Mono color={wfTokens.text}>{done}/{total}</Mono>
                  </div>
                  <div style={{ height: 5, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(done / total) * 100}%`, background: c }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, paddingTop: 4, borderTop: `1px dashed ${wfTokens.borderSoft}`, alignItems: 'center' }}>
                  <Mono size={9}><Ic d={I.cal} size={10} /> próx: {due}</Mono>
                  <div style={{ flex: 1 }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['new', 'wait', 'exec', 'done'].map(k => {
                      const counts = [Math.floor(total * 0.2), Math.floor(total * 0.1), Math.floor(total * 0.3), done];
                      return <Pill key={k} c={stateColor(k)} style={{ padding: '1px 5px', fontSize: 8 }}>{counts[['new', 'wait', 'exec', 'done'].indexOf(k)]}</Pill>;
                    })}
                  </div>
                </div>
              </SB>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

export function ProjectsB() {
  return (
    <Page>
      <TopBar active="projects" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista tabla" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>filtros</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> proyecto</Btn>
            </div>
          }>Proyectos</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden' }}>
            <SB style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.6fr 90px 80px 100px 180px 80px 30px',
                gap: 12, padding: '10px 14px',
                background: wfTokens.surfaceLo, borderBottom: `1px solid ${wfTokens.borderSoft}`,
              }}>
                {['Proyecto', 'Estado', 'Tareas', 'Progreso', 'Distribución', 'Próx.', ''].map((h, i) => (
                  <Mono key={i} size={9}>{h.toUpperCase()}</Mono>
                ))}
              </div>
              {PROJECTS.map(([n, c, done, total, status, due, desc], i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1.6fr 90px 80px 100px 180px 80px 30px',
                  gap: 12, padding: '12px 14px', alignItems: 'center',
                  borderBottom: i < PROJECTS.length - 1 ? `1px solid ${wfTokens.borderSoft}` : 'none',
                  opacity: status === 'archivado' ? 0.5 : 1,
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dot c={c} />
                      <span style={{ fontSize: 12, color: wfTokens.text }}>{n}</span>
                    </div>
                    <Mono size={9} style={{ marginLeft: 14 }}>{desc.slice(0, 55)}</Mono>
                  </div>
                  <Pill c={status === 'activo' ? 'oklch(70% 0.09 150)' : wfTokens.textDim}>{status}</Pill>
                  <Mono color={wfTokens.text}>{done}/{total}</Mono>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(done / total) * 100}%`, background: c }} />
                    </div>
                    <Mono size={9}>{Math.round((done / total) * 100)}%</Mono>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden' }}>
                    {[['new', 0.25], ['wait', 0.15], ['exec', 0.35], ['done', 0.25]].map(([k, p], j) => (
                      <div key={j} style={{ flex: p, background: stateColor(k) }} />
                    ))}
                  </div>
                  <Mono size={9}>{due}</Mono>
                  <Ic d={I.more} size={11} />
                </div>
              ))}
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function ProjectsC() {
  const items = [
    [PROJECTS[0], 240, 220, 110],
    [PROJECTS[1], 480, 180, 80],
    [PROJECTS[2], 380, 360, 95],
    [PROJECTS[3], 200, 380, 55],
    [PROJECTS[4], 560, 350, 60],
    [PROJECTS[5], 590, 100, 70],
  ];
  return (
    <Page>
      <TopBar active="projects" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista constelación · tamaño = volumen · brillo = actividad" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>resetear</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> proyecto</Btn>
            </div>
          }>Universo</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', position: 'relative' }}>
            <SB style={{
              height: '100%', position: 'relative', overflow: 'hidden',
              background: `radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--wf-accent) 6%, ${wfTokens.surfaceLo}), ${wfTokens.surfaceLo} 70%)`,
            }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
                  width: 2, height: 2, borderRadius: 999,
                  background: wfTokens.textDim, opacity: 0.4,
                }} />
              ))}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <ellipse cx="50%" cy="50%" rx="40%" ry="32%" fill="none" stroke={wfTokens.borderSoft} strokeDasharray="3 4" />
                <ellipse cx="50%" cy="50%" rx="25%" ry="20%" fill="none" stroke={wfTokens.borderSoft} strokeDasharray="3 4" />
              </svg>
              <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <HW size={32}>54</HW>
                <div><Mono>tareas totales</Mono></div>
              </div>
              {items.map(([[n, c, done, total, status, due, desc], x, y, size], i) => (
                <div key={i} style={{
                  position: 'absolute', left: x, top: y,
                  width: size, height: size, borderRadius: 999,
                  background: `radial-gradient(circle, color-mix(in oklch, ${c} 50%, transparent) 0%, color-mix(in oklch, ${c} 15%, transparent) 70%)`,
                  border: `1px solid color-mix(in oklch, ${c} 50%, ${wfTokens.border})`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', padding: 8,
                  opacity: status === 'archivado' ? 0.4 : 1,
                }}>
                  <Dot c={c} size={8} />
                  <div style={{ marginTop: 4, fontFamily: '"Caveat", cursive', fontSize: 16, color: wfTokens.text, lineHeight: 1.1 }}>{n}</div>
                  <Mono size={8}>{done}/{total}</Mono>
                </div>
              ))}
              <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', background: wfTokens.surface, border: `1px solid ${wfTokens.borderSoft}`, borderRadius: 5 }}>
                <Mono>LEYENDA</Mono>
                {['new', 'wait', 'exec', 'done'].map(k => (
                  <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Dot c={stateColor(k)} size={6} />
                    <Mono size={9}>{({ new: 'nueva', wait: 'espera', exec: 'ejecución', done: 'hecho' })[k]}</Mono>
                  </span>
                ))}
              </div>
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function SettingsA() {
  const sections = [
    ['perfil', 'Perfil', 'user', true],
    ['account', 'Cuenta', 'cog'],
    ['appearance', 'Apariencia', 'grid'],
    ['states', 'Estados de tareas', 'flag'],
    ['notifications', 'Notificaciones', 'bell'],
    ['shortcuts', 'Atajos de teclado', 'arrow'],
    ['data', 'Datos e importar', 'folder'],
  ];
  return (
    <Page>
      <TopBar active="" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="ajustes personales">Configuración</PageTitle>
          <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 0 }}>
            <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, padding: '4px 12px 22px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sections.map(([k, l, ic, active]) => (
                <div key={k} style={{
                  padding: '7px 10px', borderRadius: 5,
                  background: active ? wfTokens.surfaceHi : 'transparent',
                  border: active ? `1px solid ${wfTokens.border}` : '1px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: active ? wfTokens.text : wfTokens.textMuted,
                  fontSize: 11,
                }}>
                  <Ic d={I[ic]} size={12} c={active ? wfTokens.text : wfTokens.textMuted} />
                  {l}
                </div>
              ))}
            </div>
            <div style={{ padding: '4px 22px 22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SecHead size={18} sub="cómo te muestras">Perfil</SecHead>
              <SB style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: wfTokens.surfaceHi, border: `1px solid ${wfTokens.border}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: wfTokens.text }}>tu nombre</div>
                  <Mono>tu@email.com</Mono>
                </div>
                <Btn ghost>cambiar foto</Btn>
              </SB>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Nombre">
                  <div style={{ padding: '8px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.text }}>tu nombre</div>
                </Field>
                <Field label="Email">
                  <div style={{ padding: '8px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.text }}>tu@email.com</div>
                </Field>
                <Field label="Zona horaria">
                  <SelectField value={<Mono color={wfTokens.text}>Europe/Madrid · UTC+2</Mono>} />
                </Field>
                <Field label="Idioma">
                  <SelectField value={<Mono color={wfTokens.text}>Español</Mono>} />
                </Field>
              </div>
              <SecHead size={18} sub="cuándo empieza tu semana">Preferencias</SecHead>
              <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Row label="Primer día de la semana"><Toggle3 options={['lunes', 'domingo', 'sábado']} active={0} /></Row>
                <Row label="Formato hora 24h"><Switch on /></Row>
                <Row label="Vista por defecto al abrir"><SelectField value="Tablero" /></Row>
              </SB>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function SettingsB() {
  const tabs = ['Perfil', 'Apariencia', 'Estados', 'Notificaciones', 'Atajos', 'Datos'];
  return (
    <Page>
      <TopBar active="" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px 0' }}>
            <HW size={28}>Configuración</HW>
            <Mono style={{ marginLeft: 0, display: 'block', marginTop: 4 }}>ajustes · apariencia</Mono>
          </div>
          <div style={{ padding: '12px 22px 0', display: 'flex', gap: 0, borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
            {tabs.map((t, i) => (
              <div key={t} style={{
                padding: '8px 14px', fontSize: 11,
                color: i === 1 ? wfTokens.text : wfTokens.textMuted,
                borderBottom: i === 1 ? '2px solid var(--wf-accent)' : '2px solid transparent',
                marginBottom: -1,
              }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: '14px 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SecHead size={18} sub="tema y colores">Apariencia</SecHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[['Oscuro', true], ['Claro', false], ['Sistema', false]].map(([n, active], i) => (
                <SB key={i} style={{ padding: 12, borderColor: active ? 'var(--wf-accent)' : wfTokens.border }}>
                  <div style={{ height: 60, borderRadius: 4, background: i === 0 ? wfTokens.bg : i === 1 ? '#f5f5f8' : `linear-gradient(90deg, ${wfTokens.bg} 50%, #f5f5f8 50%)`, marginBottom: 8, border: `1px solid ${wfTokens.borderSoft}` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check done={active} size={10} />
                    <span style={{ fontSize: 11, color: wfTokens.text }}>{n}</span>
                  </div>
                </SB>
              ))}
            </div>
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Row label="Color de acento">
                <div style={{ display: 'flex', gap: 6 }}>
                  {['oklch(72% 0.13 285)', 'oklch(72% 0.13 210)', 'oklch(75% 0.13 145)', 'oklch(72% 0.13 50)', 'oklch(70% 0.13 25)'].map((c, i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: 999, background: c, border: i === 0 ? `2px solid ${wfTokens.text}` : `1px solid ${wfTokens.border}`, outline: i === 0 ? '2px solid var(--wf-accent)' : 'none', outlineOffset: 1 }} />
                  ))}
                </div>
              </Row>
              <Row label="Tipografía"><Toggle3 options={['Sistema', 'Inter', 'Mono']} active={1} /></Row>
              <Row label="Densidad"><Toggle3 options={['Cómoda', 'Estándar', 'Compacta']} active={1} /></Row>
              <Row label="Tamaño de fuente">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 200 }}>
                  <Mono size={9}>A</Mono>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: wfTokens.border, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'var(--wf-accent)', borderRadius: 2 }} />
                    <div style={{ position: 'absolute', left: '40%', top: -4, width: 12, height: 12, borderRadius: 999, background: 'var(--wf-accent)' }} />
                  </div>
                  <Mono size={11}>A</Mono>
                </div>
              </Row>
              <Row label="Animaciones reducidas"><Switch /></Row>
              <Row label="Esquinas redondeadas"><Switch on /></Row>
            </SB>
            <SecHead size={14}>Nombres de los estados</SecHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[['new', 'Nueva'], ['wait', 'En espera'], ['exec', 'En ejecución'], ['done', 'Finalizada']].map(([k, v]) => (
                <div key={k}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <StateDot k={k} size={6} />
                    <Mono size={9}>{k}</Mono>
                  </div>
                  <div style={{ padding: '7px 10px', borderRadius: 4, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, fontSize: 11, color: wfTokens.text }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
