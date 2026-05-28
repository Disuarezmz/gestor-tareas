// List variations

const LIST_TASKS = [
  ['Cerrar onboarding rediseño', 'high', 'exec', 'hoy', 'Rediseño app', ['ux','ios'], [3,5], 5],
  ['Revisar PR #482', 'med', 'exec', 'hoy', 'Backend v2', ['code-review'], null, 3],
  ['Llamada con diseño', 'med', 'wait', 'hoy 16:00', 'Rediseño app', ['meeting'], null, 0],
  ['Diseño cabecera landing', 'med', 'exec', '28 may', 'Marketing Q3', ['marketing','ux'], [1,3], 1],
  ['Test e2e checkout', 'med', 'new', '29 may', 'Backend v2', ['qa'], [2,6], 0],
  ['Aprobación legal copy', 'high', 'wait', '30 may', 'Marketing Q3', ['legal'], null, 1],
  ['Demo cliente Acme', 'high', 'new', '31 may', 'Marketing Q3', ['sales'], null, 0],
  ['Migrar a Postgres 16', 'high', 'exec', '02 jun', 'Backend v2', ['backend','infra'], [4,7], 8],
  ['Release v2.4', 'med', 'new', '03 jun', 'Backend v2', ['release'], null, 2],
  ['Refactor módulo auth', 'high', 'new', '03 jun', 'Backend v2', ['tech-debt'], [0,4], 0],
  ['Comprar dominio', 'low', 'new', '—', 'Personal', ['ops'], null, 0],
  ['Sketch onboarding v1', 'high', 'done', '22 may', 'Rediseño app', ['ux'], null, 4],
  ['Setup CI nuevo', 'med', 'done', '24 may', 'Backend v2', ['infra'], null, 0],
];

function ListA() {
  // Tabla densa con columnas
  return (
    <Page>
      <TopBar active="list" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="todas las tareas · 14 activas" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost><Ic d={I.filter} size={10} /> filtros</Btn>
              <Btn ghost>orden: fecha ↓</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Lista</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <SB style={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 90px 110px 130px 90px 70px 30px',
                gap: 10, padding: '8px 12px',
                background: wfTokens.surfaceLo,
                borderBottom: `1px solid ${wfTokens.borderSoft}`,
                fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: wfTokens.textDim,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                <div></div>
                <div>Tarea</div>
                <div>Estado</div>
                <div>Proyecto</div>
                <div>Etiquetas</div>
                <div>Fecha</div>
                <div>Prio</div>
                <div></div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {LIST_TASKS.slice(0, 12).map(([t, p, s, d, proj, tg, sub, com], i) => (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr 90px 110px 130px 90px 70px 30px',
                    gap: 10, padding: '8px 12px',
                    alignItems: 'center',
                    borderBottom: `1px solid ${wfTokens.borderSoft}`,
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}>
                    <Check done={s==='done'} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: s==='done'?wfTokens.textDim:wfTokens.text, textDecoration: s==='done'?'line-through':'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</div>
                      {(sub || com>0) && (
                        <div style={{ display: 'flex', gap: 8, fontSize: 9, color: wfTokens.textDim }}>
                          {sub && <span><Ic d={I.check} size={8} /> {sub[0]}/{sub[1]}</span>}
                          {com>0 && <span><Ic d={I.comment} size={8} /> {com}</span>}
                        </div>
                      )}
                    </div>
                    <StatePill k={s} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: wfTokens.textMuted }}>
                      <Dot c={proj.startsWith('Re')?wfTokens.hueExec:proj.startsWith('Ma')?wfTokens.hueWait:proj.startsWith('Ba')?wfTokens.hueNew:wfTokens.hueDone} size={6} />
                      {proj}
                    </div>
                    <div style={{ display: 'flex', gap: 3, overflow: 'hidden' }}>
                      {tg.slice(0,2).map((tag,j) => <Tag key={j}>{tag}</Tag>)}
                    </div>
                    <Mono size={9}>{d}</Mono>
                    <Prio level={p} />
                    <Ic d={I.more} size={11} />
                  </div>
                ))}
              </div>
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ListB() {
  // Cards apiladas
  return (
    <Page>
      <TopBar active="list" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista de tarjeta · 14 activas" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>filtros</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Lista</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LIST_TASKS.slice(0, 8).map(([t, p, s, d, proj, tg, sub, com], i) => (
              <SB key={i} hi style={{ padding: 12, borderLeft: `3px solid ${stateColor(s)}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <Check done={s==='done'} size={14} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 12, color: s==='done'?wfTokens.textDim:wfTokens.text, fontWeight: 500 }}>{t}</div>
                    <Prio level={p} />
                    <StatePill k={s} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10, color: wfTokens.textMuted }}>
                    <span><Ic d={I.folder} size={9} /> {proj}</span>
                    <span><Ic d={I.cal} size={9} /> {d}</span>
                    {sub && <span><Ic d={I.check} size={9} /> {sub[0]}/{sub[1]}</span>}
                    {com>0 && <span><Ic d={I.comment} size={9} /> {com}</span>}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {tg.map((tag,j) => <Tag key={j}>{tag}</Tag>)}
                    </div>
                  </div>
                </div>
                <Ic d={I.more} size={12} />
              </SB>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

function ListC() {
  // Agrupada por fecha
  const groups = [
    ['Hoy', 'miércoles 27 mayo', LIST_TASKS.filter(t => t[3].startsWith('hoy'))],
    ['Mañana', 'jueves 28 mayo', LIST_TASKS.filter(t => t[3] === '28 may')],
    ['Esta semana', '29 - 31 mayo', LIST_TASKS.filter(t => ['29 may','30 may','31 may'].includes(t[3]))],
    ['Próxima semana', '01 - 07 jun', LIST_TASKS.filter(t => ['02 jun','03 jun'].includes(t[3]))],
  ];
  return (
    <Page>
      <TopBar active="list" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="agrupado por fecha de vencimiento" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>agrupar: fecha</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Programadas</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groups.map(([g, sub, tasks], gi) => (
              <div key={gi}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, paddingBottom: 4, borderBottom: `1px dashed ${wfTokens.borderSoft}` }}>
                  <HW size={18}>{g}</HW>
                  <Mono>· {sub}</Mono>
                  <div style={{ flex: 1 }} />
                  <Mono>{tasks.length} tareas</Mono>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {tasks.map(([t, p, s, d, proj, tg, sub2], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i<tasks.length-1?`1px solid ${wfTokens.borderSoft}`:'none' }}>
                      <Check done={s==='done'} size={11} />
                      <Dot c={stateColor(s)} size={6} />
                      <span style={{ fontSize: 11, color: wfTokens.text, flex: 1 }}>{t}</span>
                      <Mono size={9}>{proj}</Mono>
                      <div style={{ width: 60 }}>{p !== 'low' && <Prio level={p} />}</div>
                      <Mono size={9} style={{ width: 50, textAlign: 'right' }}>{d}</Mono>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

function ListD() {
  // Timeline vertical (atrevido) - flujo de fechas con tracks por proyecto
  return (
    <Page>
      <TopBar active="list" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="línea de tiempo · próximos 14 días" right={
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>2 semanas</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Timeline</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 60, top: 0, bottom: 0, width: 1, background: wfTokens.border }} />
              {[
                ['hoy', '27 may', [['Onboarding rediseño', 'exec', 'high', 'Rediseño app', wfTokens.hueExec], ['Revisar PR #482', 'exec', 'med', 'Backend v2', wfTokens.hueNew], ['Llamada diseño', 'wait', 'med', 'Rediseño app', wfTokens.hueExec]]],
                ['mañ.', '28 may', [['Diseño cabecera', 'exec', 'med', 'Marketing Q3', wfTokens.hueWait]]],
                ['jue', '29 may', [['Test e2e checkout', 'new', 'med', 'Backend v2', wfTokens.hueNew]]],
                ['vie', '30 may', [['Aprobación legal', 'wait', 'high', 'Marketing Q3', wfTokens.hueWait]]],
                ['sáb', '31 may', [['Demo cliente Acme', 'new', 'high', 'Marketing Q3', wfTokens.hueWait]]],
                ['mar', '02 jun', [['Migrar Postgres 16', 'exec', 'high', 'Backend v2', wfTokens.hueNew]]],
                ['mié', '03 jun', [['Release v2.4', 'new', 'med', 'Backend v2', wfTokens.hueNew], ['Refactor auth', 'new', 'high', 'Backend v2', wfTokens.hueNew]]],
              ].map(([day, date, tasks], i) => (
                <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '7px 0', flex: tasks.length }}>
                  <div style={{ width: 55, textAlign: 'right', paddingTop: 4 }}>
                    <HW size={16} color={day==='hoy'?wfTokens.text:wfTokens.textMuted}>{day}</HW>
                    <div><Mono size={9}>{date}</Mono></div>
                  </div>
                  <div style={{ position: 'absolute', left: 56, top: 12, width: 10, height: 10, borderRadius: 999, background: day==='hoy'?'var(--wf-accent)':wfTokens.surfaceHi, border: `2px solid ${wfTokens.bg}`, boxShadow: day==='hoy'?'0 0 0 2px var(--wf-accent)':'none' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 12 }}>
                    {tasks.map(([t, s, p, proj, c], j) => (
                      <SB key={j} hi style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8, borderLeft: `2px solid ${c}` }}>
                        <StateDot k={s} />
                        <span style={{ fontSize: 11, color: wfTokens.text, flex: 1 }}>{t}</span>
                        <Mono size={9}>{proj}</Mono>
                        <Prio level={p} />
                      </SB>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { ListA, ListB, ListC, ListD });
