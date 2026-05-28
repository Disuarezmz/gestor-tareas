import { wfTokens, stateColor } from '../../../constants/tokens.js';
import { I } from '../../../constants/icons.js';
import { Page, HW, Mono, SB, Dot, StateDot, Prio, Btn, Check, Ic } from '../../primitives/index.jsx';
import { TopBar, Sidebar, PageTitle, TaskCard, ColHead } from '../../chrome/index.jsx';

const KANBAN_DATA = {
  new: [
    ['Refactor módulo auth', 'high', '03 jun', ['backend', 'tech-debt'], [0, 4], 0],
    ['Comprar dominio del proyecto', 'low', '—', ['ops'], null, 0],
    ['Investigar libs de gráficos', 'med', '—', ['research'], null, 1],
    ['Bug: select se cierra', 'high', '28 may', ['bug', 'ux'], null, 2],
  ],
  wait: [
    ['Llamada con diseño', 'med', 'hoy 16:00', ['meeting'], null, 3],
    ['Aprobación legal copy', 'high', '30 may', ['legal'], null, 1],
  ],
  exec: [
    ['Cerrar onboarding rediseño', 'high', 'hoy', ['ux', 'ios'], [3, 5], 5],
    ['Revisar PR #482', 'med', 'hoy', ['code-review'], null, 3],
    ['Diseño cabecera landing', 'med', '28 may', ['marketing', 'ux'], [1, 3], 1],
    ['Test e2e checkout', 'med', '29 may', ['qa', 'frontend'], [2, 6], 0],
    ['Migrar a Postgres 16', 'high', '02 jun', ['backend', 'infra'], [4, 7], 8],
  ],
  done: [
    ['Setup CI nuevo', 'med', '24 may', ['infra'], null, 0],
    ['Borrar pruebas obsoletas', 'low', '23 may', [], null, 0],
    ['Sketch onboarding v1', 'high', '22 may', ['ux'], null, 4],
    ['Reunión kick-off Q3', 'med', '20 may', ['meeting'], null, 0],
    ['Update README', 'low', '19 may', ['docs'], null, 0],
    ['Logo monocromo export', 'low', '18 may', ['brand'], null, 1],
    ['Renovar cert SSL', 'high', '17 may', ['infra'], null, 0],
  ],
};

export function KanbanColumns({ data = KANBAN_DATA, dense, columnWidth }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: columnWidth || 'repeat(4, 1fr)', gap: 12, padding: '4px 22px 22px', flex: 1, overflow: 'hidden' }}>
      {['new', 'wait', 'exec', 'done'].map((k) => (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <ColHead k={k} count={data[k].length} />
          <div style={{ background: wfTokens.surfaceLo, border: `1px dashed ${wfTokens.borderSoft}`, borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'hidden' }}>
            {data[k].map(([t, p, d, tg, sub, com], i) => (
              <TaskCard key={i} title={t} prio={p} due={d} tags={tg} subs={sub} comments={com || null} dense={dense} />
            ))}
            <div style={{ padding: 6, textAlign: 'center', color: wfTokens.textDim, fontSize: 10, border: `1px dashed ${wfTokens.borderSoft}`, borderRadius: 4, cursor: 'pointer' }}>
              + añadir tarea
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanA() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar active="rediseno" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="proyecto · 14 tareas activas · 7 completadas" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost><Ic d={I.filter} size={10} /> filtros</Btn>
              <Btn ghost><Ic d={I.user} size={10} /> agrupar</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> nueva tarea</Btn>
            </div>
          }>Rediseño app</PageTitle>
          <KanbanColumns />
        </div>
      </div>
    </Page>
  );
}

export function KanbanB() {
  const lanes = [
    ['Rediseño app', wfTokens.hueExec, { new: 2, wait: 1, exec: 3, done: 4 }],
    ['Marketing Q3', wfTokens.hueWait, { new: 1, wait: 1, exec: 2, done: 1 }],
    ['Backend v2', wfTokens.hueNew, { new: 1, wait: 0, exec: 1, done: 2 }],
  ];
  const sample = {
    new: ['Refactor auth', 'Bug select', 'Comprar dominio'],
    wait: ['Llamada diseño', 'Aprobación legal'],
    exec: ['Onboarding rediseño', 'Revisar PR', 'Cabecera landing'],
    done: ['Setup CI', 'Sketch v1', 'Logo export'],
  };
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="todas las tareas · agrupado por proyecto" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>vista</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Tablero general</PageTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(4, 1fr)', gap: 10, padding: '4px 22px 0' }}>
            <div />
            {['new', 'wait', 'exec', 'done'].map((k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px' }}>
                <StateDot k={k} /><HW size={16}>{({ new: 'Nueva', wait: 'Espera', exec: 'Ejecución', done: 'Finalizada' })[k]}</HW>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lanes.map(([name, c, counts], li) => (
              <div key={li} style={{ display: 'grid', gridTemplateColumns: '140px repeat(4, 1fr)', gap: 10, flex: 1, minHeight: 0 }}>
                <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, paddingRight: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Dot c={c} /><HW size={16}>{name}</HW>
                  </div>
                  <Mono>{Object.values(counts).reduce((a, b) => a + b, 0)} tareas</Mono>
                </div>
                {['new', 'wait', 'exec', 'done'].map((k) => (
                  <div key={k} style={{ background: wfTokens.surfaceLo, border: `1px dashed ${wfTokens.borderSoft}`, borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Array.from({ length: counts[k] }).map((_, i) => (
                      <SB key={i} hi style={{ padding: 6, borderLeft: `2px solid ${c}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 10, color: wfTokens.text }}>{sample[k][i % sample[k].length]}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Mono size={8}>{['hoy', 'mañ', 'vie', 'lun'][i % 4]}</Mono>
                          <div style={{ flex: 1 }} />
                          {i % 2 === 0 && <Prio level={['high', 'med', 'low'][i % 3]} />}
                        </div>
                      </SB>
                    ))}
                    {counts[k] === 0 && <Mono size={9} color={wfTokens.textDim} style={{ textAlign: 'center', padding: 8 }}>—</Mono>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

export function KanbanC() {
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="rediseño app · modo compacto" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>densidad</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Rediseño app</PageTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '4px 22px 22px', flex: 1, overflow: 'hidden' }}>
            {['new', 'wait', 'exec', 'done'].map((k) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderBottom: `2px solid ${stateColor(k)}` }}>
                  <Dot c={stateColor(k)} size={6} />
                  <span style={{ fontSize: 10, color: wfTokens.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {({ new: 'Nueva', wait: 'En espera', exec: 'En ejecución', done: 'Finalizada' })[k]}
                  </span>
                  <div style={{ flex: 1 }} />
                  <Mono size={9}>{KANBAN_DATA[k].length}</Mono>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {KANBAN_DATA[k].map(([t, p, d, tg, sub, com], i) => (
                    <div key={i} style={{ padding: '7px 8px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <Check size={9} done={k === 'done'} />
                        <div style={{ flex: 1, fontSize: 10, color: k === 'done' ? wfTokens.textDim : wfTokens.text, lineHeight: 1.3, textDecoration: k === 'done' ? 'line-through' : 'none' }}>{t}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 15 }}>
                        {p !== 'low' && <Dot c={p === 'high' ? wfTokens.hueHigh : wfTokens.hueMed} size={5} />}
                        <Mono size={8}>{d}</Mono>
                        {sub && <Mono size={8}>· {sub[0]}/{sub[1]}</Mono>}
                        {com > 0 && <Mono size={8}>· {com}c</Mono>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: 6, color: wfTokens.textDim, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Ic d={I.plus} size={9} /> añadir
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

export function KanbanD() {
  const items = {
    new: [['Refactor módulo auth', 'high', 'L'], ['Bug: select se cierra', 'high', 'M'], ['Comprar dominio', 'low', 'S'], ['Investigar libs gráficos', 'med', 'S']],
    wait: [['Aprobación legal', 'high', 'L'], ['Llamada diseño', 'med', 'S']],
    exec: [['Onboarding rediseño', 'high', 'XL'], ['Migrar a Postgres 16', 'high', 'L'], ['Revisar PR #482', 'med', 'M'], ['Cabecera landing', 'med', 'S'], ['Test e2e checkout', 'med', 'S']],
    done: [['Setup CI', 'med', 'S'], ['Sketch v1', 'high', 'M'], ['Logo export', 'low', 'S'], ['SSL renovado', 'high', 'S'], ['README update', 'low', 'S']],
  };
  const sizeMap = { XL: 96, L: 72, M: 54, S: 38 };
  return (
    <Page>
      <TopBar active="kanban" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="rediseño app · tamaño = prioridad · color = estado" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>vista</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Mosaico</PageTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: '4px 22px 22px', flex: 1, overflow: 'hidden' }}>
            {['new', 'wait', 'exec', 'done'].map((k) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ColHead k={k} count={items[k].length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items[k].map(([t, p, sz], i) => (
                    <div key={i} style={{
                      height: sizeMap[sz],
                      borderRadius: 6,
                      background: `color-mix(in oklch, ${stateColor(k)} 22%, ${wfTokens.surface})`,
                      border: `1px solid color-mix(in oklch, ${stateColor(k)} 40%, ${wfTokens.border})`,
                      padding: 9,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      overflow: 'hidden',
                    }}>
                      <div style={{ fontSize: sz === 'XL' ? 13 : sz === 'L' ? 12 : 11, color: wfTokens.text, lineHeight: 1.3 }}>{t}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Prio level={p} />
                        <div style={{ flex: 1 }} />
                        <Mono size={8}>{sz}</Mono>
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 28, border: `1px dashed ${wfTokens.borderSoft}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: wfTokens.textDim, fontSize: 10 }}>+</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}
