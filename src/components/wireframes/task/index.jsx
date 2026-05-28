import { wfTokens, stateColor } from '../../../constants/tokens.js';
import { I } from '../../../constants/icons.js';
import { Page, HW, Mono, SB, L, Lines, Stripe, Dot, StateDot, StatePill, Prio, Tag, Btn, Check, Ic } from '../../primitives/index.jsx';
import { TopBar, Sidebar, PageTitle } from '../../chrome/index.jsx';
import { KanbanColumns } from '../kanban/index.jsx';

function MetaField({ label, value, mini }) {
  return (
    <div>
      <div style={{ marginBottom: 4 }}><Mono size={mini ? 8 : 9}>{label.toUpperCase()}</Mono></div>
      <div>{value}</div>
    </div>
  );
}

function MetaInline({ label, value }) {
  return (
    <div>
      <Mono size={8}>{label.toUpperCase()}</Mono>
      <div style={{ fontSize: 11, color: wfTokens.text, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>{value}</div>
    </div>
  );
}

function Comment({ who, when, lines }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <div style={{ width: 20, height: 20, borderRadius: 999, background: wfTokens.surfaceHi, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
          <Mono color={wfTokens.text}>{who}</Mono>
          <Mono size={8}>{when}</Mono>
        </div>
        <div style={{ marginTop: 3 }}><Lines widths={lines} h={4} c={wfTokens.borderSoft} /></div>
      </div>
    </div>
  );
}

function DetailContent() {
  return (
    <>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatePill k="exec" /><Prio level="high" />
        <div style={{ flex: 1 }} />
        <Ic d={I.link} size={12} />
        <Ic d={I.more} size={12} />
        <Ic d={I.x} size={14} />
      </div>
      <div style={{ padding: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <HW size={26}>Cerrar diseño del onboarding</HW>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <MetaInline label="proyecto" value={<><Dot c={wfTokens.hueExec} /> Rediseño app</>} />
          <MetaInline label="vence" value="hoy 18:00" />
          <MetaInline label="creada" value="hace 7 días" />
        </div>
        <div>
          <Mono>DESCRIPCIÓN</Mono>
          <Lines widths={[100, 92, 85, 70]} h={5} c={wfTokens.borderSoft} />
        </div>
        <div>
          <Mono>SUBTAREAS · 3/5</Mono>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Wireframes paso 1-3', 'Diseño visual paso 1-3', 'Estados de error', 'Animaciones', 'Export a Figma + specs'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={11} done={i < 3} />
                <span style={{ fontSize: 11, color: i < 3 ? wfTokens.textDim : wfTokens.text, textDecoration: i < 3 ? 'line-through' : 'none' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Mono>ETIQUETAS</Mono>
          <div style={{ marginTop: 6, display: 'flex', gap: 5 }}><Tag>ux</Tag><Tag>ios</Tag><Tag>onboarding</Tag></div>
        </div>
        <div>
          <Mono>COMENTARIOS · 5</Mono>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Comment who="tú" when="hace 2h" lines={[85, 60]} />
            <Comment who="diseño" when="ayer" lines={[90, 70, 45]} />
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8 }}>
        <Btn ghost>eliminar</Btn>
        <div style={{ flex: 1 }} />
        <Btn primary>marcar hecha</Btn>
      </div>
    </>
  );
}

export function DetailA() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', filter: 'brightness(0.55)' }}>
          <PageTitle sub="rediseño app">Tablero</PageTitle>
          <KanbanColumns dense />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 460, background: wfTokens.surface,
          borderLeft: `1px solid ${wfTokens.border}`,
          boxShadow: '-12px 0 36px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          <DetailContent />
        </div>
      </div>
    </Page>
  );
}

export function DetailB() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 22px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mono>tablero / rediseño app /</Mono>
            <Mono color={wfTokens.text}>onboarding-rediseño</Mono>
            <div style={{ flex: 1 }} />
            <Ic d={I.x} size={12} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0 }}>
            <div style={{ padding: '14px 22px 22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <StatePill k="exec" /><Prio level="high" />
                </div>
                <div style={{ fontFamily: '"Caveat", cursive', fontSize: 32, color: wfTokens.text, lineHeight: 1.1 }}>
                  Cerrar el diseño del onboarding y exportar especificaciones
                </div>
              </div>
              <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Mono>DESCRIPCIÓN</Mono>
                <Lines widths={[100, 95, 88, 100, 80, 92, 70]} h={5} c={wfTokens.borderSoft} />
                <Stripe h={70} label="adjunto · mockup-final.fig" style={{ marginTop: 6 }} />
              </SB>
              <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Mono>SUBTAREAS</Mono><Mono color={wfTokens.text}>3 / 5</Mono>
                  <div style={{ flex: 1 }} /><Mono>+ añadir</Mono>
                </div>
                {[['Wireframes paso 1-3', true], ['Diseño visual paso 1-3', true], ['Estados de error', true], ['Animaciones de transición', false], ['Export a Figma + specs', false]].map(([t, d], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                    <Check done={d} size={12} />
                    <span style={{ fontSize: 11, color: d ? wfTokens.textDim : wfTokens.text, textDecoration: d ? 'line-through' : 'none', flex: 1 }}>{t}</span>
                    <Mono size={9}>{['30m', '45m', '20m', '—', '1h'][i]}</Mono>
                  </div>
                ))}
              </SB>
              <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Mono>COMENTARIOS · 5</Mono>
                {[['tú', 'hace 2h', 'He cerrado los estados de error, falta animar las transiciones.'], ['diseño', 'ayer', 'Revisado, ojo con el contraste del paso 2.']].map(([w, when, txt], i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: wfTokens.surfaceHi, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}><Mono color={wfTokens.text}>{w}</Mono><Mono size={8}>{when}</Mono></div>
                      <div style={{ fontSize: 10, color: wfTokens.textMuted, marginTop: 2 }}>{txt}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, padding: '6px 8px', border: `1px dashed ${wfTokens.border}`, borderRadius: 5 }}>
                  <Mono color={wfTokens.textDim}>escribe un comentario...</Mono>
                  <div style={{ flex: 1 }} />
                  <Btn primary>enviar</Btn>
                </div>
              </SB>
            </div>
            <div style={{ borderLeft: `1px solid ${wfTokens.borderSoft}`, background: wfTokens.surfaceLo, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MetaField label="Estado" value={<StatePill k="exec" />} />
              <MetaField label="Prioridad" value={<Prio level="high" />} />
              <MetaField label="Fecha límite" value={<Mono color={wfTokens.text}>miércoles 27 mayo</Mono>} />
              <MetaField label="Proyecto" value={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Dot c={wfTokens.hueExec} /><span style={{ fontSize: 11 }}>Rediseño app</span></div>} />
              <MetaField label="Etiquetas" value={<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><Tag>ux</Tag><Tag>ios</Tag><Tag>onboarding</Tag></div>} />
              <MetaField label="Recordatorio" value={<Mono color={wfTokens.text}><Ic d={I.bell} size={10} /> 1h antes</Mono>} />
              <MetaField label="Creada" value={<Mono>20 may · hace 7 días</Mono>} />
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Btn primary>marcar como hecha</Btn>
                <Btn ghost>duplicar</Btn>
                <Btn ghost>eliminar</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function DetailC() {
  return (
    <Page>
      <TopBar active="list" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <div style={{ flex: 1, filter: 'brightness(0.45)', display: 'flex', flexDirection: 'column' }}>
          <PageTitle sub="14 activas">Lista</PageTitle>
          <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.7 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${wfTokens.border}` }} />
                <L w="40%" h={6} />
                <div style={{ flex: 1 }} />
                <L w={60} h={6} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SB style={{ width: 620, maxHeight: '90%', padding: 0, background: wfTokens.surface, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check size={14} />
              <div style={{ flex: 1, fontFamily: '"Caveat", cursive', fontSize: 24, color: wfTokens.text }}>Cerrar el diseño del onboarding</div>
              <Ic d={I.link} size={12} />
              <Ic d={I.more} size={12} />
              <Ic d={I.x} size={14} />
            </div>
            <div style={{ padding: 18, display: 'flex', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Lines widths={[100, 90, 80, 70]} h={5} c={wfTokens.borderSoft} />
                <div>
                  <Mono>SUBTAREAS · 3/5</Mono>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[true, true, true, false, false].map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Check done={d} size={10} />
                        <L w={['72%', '85%', '60%', '78%', '68%'][i]} h={5} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MetaField mini label="Estado" value={<StatePill k="exec" />} />
                <MetaField mini label="Prio" value={<Prio level="high" />} />
                <MetaField mini label="Fecha" value={<Mono>27 may</Mono>} />
                <MetaField mini label="Proyecto" value={<Mono color={wfTokens.text}>Rediseño app</Mono>} />
                <MetaField mini label="Tags" value={<div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}><Tag>ux</Tag><Tag>ios</Tag></div>} />
              </div>
            </div>
            <div style={{ padding: '12px 18px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8 }}>
              <Mono>esc para cerrar · ⌘↵ para guardar</Mono>
              <div style={{ flex: 1 }} />
              <Btn ghost>eliminar</Btn>
              <Btn primary>marcar hecha</Btn>
            </div>
          </SB>
        </div>
      </div>
    </Page>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ marginBottom: 5 }}><Mono size={9}>{label.toUpperCase()}</Mono></div>
      {children}
    </div>
  );
}

function SelectField({ value }) {
  return (
    <div style={{ padding: '7px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: wfTokens.text }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>{value}</span>
      <Ic d={I.chev} size={11} />
    </div>
  );
}

export function CreateA() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <div style={{ flex: 1, filter: 'brightness(0.45)', display: 'flex', flexDirection: 'column' }}>
          <PageTitle>Tablero</PageTitle>
          <div style={{ padding: 14, opacity: 0.6 }}><KanbanColumns dense /></div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SB style={{ width: 540, padding: 0, background: wfTokens.surface, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center' }}>
              <HW size={18}>Nueva tarea</HW>
              <div style={{ flex: 1 }} />
              <Ic d={I.x} size={14} />
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Título">
                <div style={{ padding: '10px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo }}>
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: wfTokens.text }}>Cerrar diseño del onboarding</span>
                  <span style={{ marginLeft: 2, borderLeft: '1.5px solid var(--wf-accent)', height: 18, display: 'inline-block', verticalAlign: 'middle' }} />
                </div>
              </Field>
              <Field label="Descripción">
                <div style={{ padding: '10px 12px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, minHeight: 70 }}>
                  <Lines widths={[80, 70, 55]} h={5} c={wfTokens.borderSoft} />
                </div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Proyecto"><SelectField value={<><Dot c={wfTokens.hueExec} /> Rediseño app</>} /></Field>
                <Field label="Estado"><SelectField value={<><StateDot k="new" /> Nueva</>} /></Field>
                <Field label="Fecha límite"><SelectField value={<><Ic d={I.cal} size={10} /> 27 mayo · 18:00</>} /></Field>
                <Field label="Prioridad">
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['low', 'med', 'high'].map((p) => (
                      <div key={p} style={{
                        flex: 1, padding: '6px 8px', borderRadius: 4,
                        border: `1px solid ${p === 'high' ? wfTokens.hueHigh : wfTokens.border}`,
                        background: p === 'high' ? `color-mix(in oklch, ${wfTokens.hueHigh} 20%, transparent)` : 'transparent',
                        textAlign: 'center', fontSize: 10,
                        color: p === 'high' ? wfTokens.text : wfTokens.textMuted,
                      }}>{({ low: 'Baja', med: 'Media', high: 'Alta' })[p]}</div>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Etiquetas">
                <div style={{ padding: '6px 10px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag>ux</Tag><Tag>ios</Tag><Mono color={wfTokens.textDim}>+ añadir</Mono>
                </div>
              </Field>
            </div>
            <div style={{ padding: '12px 18px', borderTop: `1px solid ${wfTokens.borderSoft}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Mono>⌘↵ crear · esc cancelar</Mono>
              <div style={{ flex: 1 }} />
              <Btn ghost>guardar borrador</Btn>
              <Btn primary>crear tarea</Btn>
            </div>
          </SB>
        </div>
      </div>
    </Page>
  );
}

export function CreateB() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <div style={{ flex: 1, filter: 'brightness(0.4)', display: 'flex', flexDirection: 'column' }}>
          <PageTitle>Tablero</PageTitle>
          <div style={{ opacity: 0.6 }}><KanbanColumns dense /></div>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
          <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SB style={{ padding: 0, background: wfTokens.surface, boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
                <Ic d={I.plus} size={16} c="var(--wf-accent)" />
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: 24, color: wfTokens.text, flex: 1 }}>
                  Cerrar diseño onboarding @rediseño #ux #ios !alta mañana 18h
                </span>
                <Mono>⌘↵</Mono>
              </div>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Mono>VISTA PREVIA · se va a crear:</Mono>
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 6, marginTop: 4 }}>
                  <Mono size={9}>título</Mono><span style={{ fontSize: 11 }}>Cerrar diseño onboarding</span>
                  <Mono size={9}>proyecto</Mono><span style={{ fontSize: 11, color: wfTokens.text }}><Dot c={wfTokens.hueExec} /> Rediseño app</span>
                  <Mono size={9}>etiquetas</Mono><div style={{ display: 'flex', gap: 4 }}><Tag>ux</Tag><Tag>ios</Tag></div>
                  <Mono size={9}>prioridad</Mono><div><Prio level="high" /></div>
                  <Mono size={9}>vence</Mono><span style={{ fontSize: 11, color: wfTokens.text }}>jue 28 may · 18:00</span>
                  <Mono size={9}>estado</Mono><div><StatePill k="new" /></div>
                </div>
              </div>
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

export function CreateC() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="nueva tarea · página completa">Crear</PageTitle>
          <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>
            <div style={{ padding: '14px 22px 22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Título">
                <div style={{ padding: '14px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo }}>
                  <span style={{ fontFamily: '"Caveat", cursive', fontSize: 24, color: wfTokens.text }}>Cerrar diseño del onboarding y exportar specs</span>
                </div>
              </Field>
              <Field label="Descripción">
                <div style={{ padding: '12px 14px', borderRadius: 5, border: `1px solid ${wfTokens.border}`, background: wfTokens.surfaceLo, minHeight: 100 }}>
                  <Lines widths={[95, 88, 70, 80, 60]} h={5} c={wfTokens.borderSoft} />
                </div>
              </Field>
              <Field label="Subtareas">
                <SB style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Wireframes paso 1-3', 'Diseño visual', 'Estados de error', 'Export specs'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={11} />
                      <span style={{ fontSize: 11, flex: 1 }}>{t}</span>
                      <Ic d={I.x} size={10} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: wfTokens.textDim }}>
                    <Ic d={I.plus} size={10} /> <Mono>añadir subtarea</Mono>
                  </div>
                </SB>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Field label="Proyecto"><SelectField value={<><Dot c={wfTokens.hueExec} /> Rediseño app</>} /></Field>
                <Field label="Estado"><SelectField value={<><StateDot k="new" /> Nueva</>} /></Field>
                <Field label="Prioridad"><SelectField value={<Prio level="high" />} /></Field>
              </div>
            </div>
            <div style={{ borderLeft: `1px solid ${wfTokens.borderSoft}`, background: wfTokens.surfaceLo, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Mono>VISTA PREVIA EN TABLERO</Mono>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Btn primary>crear tarea</Btn>
                <Btn ghost>cancelar</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
