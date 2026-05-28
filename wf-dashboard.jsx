// Dashboard variations

function DashboardA() {
  // Cuadrícula clásica de widgets
  return (
    <Page>
      <TopBar active="dashboard" />
      <div style={{ flex: 1, display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PageTitle sub="lunes 27 mayo · 14 tareas activas">Buenas tardes</PageTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, padding: '0 22px 22px', flex: 1 }}>
            {/* Hoy */}
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, gridRow: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <HW size={20}>Para hoy</HW>
                <Mono>6 pendientes</Mono>
              </div>
              {[
                ['Cerrar onboarding rediseño', 'high', 'exec', [3,5]],
                ['Revisar PR #482', 'med', 'exec', null],
                ['Llamada con diseño 16:00', 'med', 'wait', null],
                ['Comprar dominio del proyecto', 'low', 'new', null],
                ['Refactor módulo auth', 'high', 'new', [0,4]],
                ['Cancelar suscripción vieja', 'low', 'done', null],
              ].map(([t, p, s, sub], i) => (
                <TaskCard key={i} title={t} prio={p} state={s} due={i<3?'hoy':'mañ.'} subs={sub} tags={i===0?['ux','ios']:[]} comments={i===1?3:null} dense />
              ))}
            </SB>
            {/* Stats */}
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SecHead sub="esta semana">Progreso</SecHead>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                {[40, 65, 35, 80, 55, 70, 25].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: `${h}%`, background: i===4 ? 'var(--wf-accent)' : wfTokens.border, borderRadius: 2 }} />
                    <Mono size={8}>{'lmxjvsd'[i]}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
                <div><HW size={22}>12</HW><Mono size={9}> completadas</Mono></div>
                <div><HW size={22}>4</HW><Mono size={9}> atrasadas</Mono></div>
              </div>
            </SB>
            {/* Por estado */}
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SecHead>Por estado</SecHead>
              {['new', 'wait', 'exec', 'done'].map((k, i) => {
                const n = [4, 2, 5, 12][i];
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StateDot k={k} />
                    <span style={{ flex: 1, fontSize: 11, color: wfTokens.textMuted }}>{({new:'Nueva',wait:'En espera',exec:'En ejecución',done:'Finalizada'})[k]}</span>
                    <div style={{ width: 60, height: 4, background: wfTokens.border, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${n*7}%`, background: stateColor(k) }} />
                    </div>
                    <Mono>{n}</Mono>
                  </div>
                );
              })}
            </SB>
            {/* Próximas */}
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SecHead sub="7 próximos días">Vencimientos</SecHead>
              {[
                ['mar 28', 'Diseño cabecera', 'high'],
                ['mié 29', 'Test e2e checkout', 'med'],
                ['vie 31', 'Demo cliente', 'high'],
                ['lun 03', 'Release v2.4', 'med'],
              ].map(([d, t, p], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: i<3?`1px dashed ${wfTokens.borderSoft}`:'none' }}>
                  <Mono size={9} style={{ width: 40 }}>{d}</Mono>
                  <span style={{ flex: 1, fontSize: 11 }}>{t}</span>
                  <Prio level={p} />
                </div>
              ))}
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

function DashboardB() {
  // Agenda timeline lateral + focus de hoy en grande
  return (
    <Page>
      <TopBar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Main focus */}
          <div style={{ flex: 1, padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Mono>27 · MAYO · MIÉRCOLES</Mono>
              <div style={{ marginTop: 6 }}><HW size={34}>Tres cosas para hoy.</HW></div>
            </div>
            {[
              ['Cerrar diseño del onboarding', 'Rediseño app · vence hoy', 'high', 'exec', [3,5]],
              ['Revisar PR del módulo de pagos', 'Backend v2 · 16:00', 'med', 'exec', null],
              ['Escribir copy del landing', 'Marketing Q3 · vence mañana', 'low', 'new', [1,3]],
            ].map(([t, sub, p, s, subs], i) => (
              <SB key={i} hi style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', borderLeft: `3px solid ${stateColor(s)}` }}>
                <HW size={32} color={wfTokens.textDim}>{i+1}</HW>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: wfTokens.text, marginBottom: 3 }}>{t}</div>
                  <Mono>{sub}</Mono>
                  {subs && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {Array.from({length: subs[1]}).map((_, j) => (
                        <div key={j} style={{ flex: 1, height: 4, borderRadius: 2, background: j<subs[0]?'var(--wf-accent)':wfTokens.border }} />
                      ))}
                    </div>
                  )}
                </div>
                <Prio level={p} />
                <Check done={i===0} size={14} />
              </SB>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Btn ghost><Ic d={I.plus} size={10} /> añadir foco</Btn>
              <div style={{ flex: 1 }} />
              <Mono>queue: 8 más</Mono>
            </div>
            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[['Nuevas', 4, 'new'], ['Espera', 2, 'wait'], ['Ejecución', 5, 'exec'], ['Finalizadas', 12, 'done']].map(([l, n, k], i) => (
                <SB key={i} style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StateDot k={k} />
                  <HW size={20}>{n}</HW>
                  <Mono>{l}</Mono>
                </SB>
              ))}
            </div>
          </div>
          {/* Timeline lateral */}
          <div style={{ width: 240, borderLeft: `1px solid ${wfTokens.borderSoft}`, background: wfTokens.surfaceLo, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SecHead size={16} sub="hoy">Agenda</SecHead>
            <div style={{ position: 'relative', flex: 1, paddingLeft: 30 }}>
              <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 1, background: wfTokens.border }} />
              {[
                ['09:00', 'Standup', 'exec'],
                ['10:30', 'Diseño onboarding', 'exec'],
                ['12:00', 'Pausa', null],
                ['13:00', 'Revisar PR', 'wait'],
                ['16:00', 'Llamada diseño', 'new'],
                ['17:30', 'Copy landing', 'new'],
              ].map(([t, label, s], i) => (
                <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <div style={{ position: 'absolute', left: -16, width: 8, height: 8, borderRadius: 999, background: s ? stateColor(s) : wfTokens.border, border: `2px solid ${wfTokens.bg}` }} />
                  <Mono size={9} style={{ width: 32 }}>{t}</Mono>
                  <span style={{ fontSize: 10, color: s ? wfTokens.text : wfTokens.textDim }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function DashboardC() {
  // Heatmap anual + lista lateral (atrevido)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return (
    <Page>
      <TopBar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <HW size={28}>Tu año en tareas</HW>
              <div style={{ marginTop: 4 }}><Mono>187 completadas · racha 12 días · 14 activas</Mono></div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn ghost>2024</Btn>
              <Btn primary>2026</Btn>
            </div>
          </div>
          {/* Heatmap */}
          <SB style={{ padding: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', gap: 3, paddingLeft: 24, marginBottom: 4 }}>
                {months.map(m => <div key={m} style={{ flex: 1, textAlign: 'left' }}><Mono size={8}>{m}</Mono></div>)}
              </div>
              {Array.from({ length: 7 }).map((_, row) => (
                <div key={row} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Mono size={8} style={{ width: 20 }}>{['lun','mar','mié','jue','vie','sáb','dom'][row]}</Mono>
                  {Array.from({ length: 53 }).map((_, col) => {
                    const seed = (row*7 + col*3) % 11;
                    const v = seed > 8 ? 4 : seed > 6 ? 3 : seed > 4 ? 2 : seed > 2 ? 1 : 0;
                    const opacity = [0.06, 0.2, 0.45, 0.7, 1][v];
                    const isToday = row === 2 && col === 21;
                    return <div key={col} style={{
                      flex: 1, aspectRatio: '1/1',
                      background: v === 0 ? wfTokens.surfaceHi : `color-mix(in oklch, var(--wf-accent) ${opacity*100}%, ${wfTokens.surfaceHi})`,
                      borderRadius: 2,
                      outline: isToday ? `1.5px solid ${wfTokens.text}` : 'none',
                      outlineOffset: 1,
                    }} />;
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
              <Mono>menos</Mono>
              {[0.06, 0.2, 0.45, 0.7, 1].map((o, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: o === 0.06 ? wfTokens.surfaceHi : `color-mix(in oklch, var(--wf-accent) ${o*100}%, ${wfTokens.surfaceHi})` }} />
              ))}
              <Mono>más</Mono>
            </div>
          </SB>
          {/* Bottom row: pendientes + por proyecto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SecHead size={16} sub="14 activas">Pendientes</SecHead>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Onboarding rediseño', 'high', 'exec', 'hoy'],
                  ['Revisar PR #482', 'med', 'exec', 'hoy'],
                  ['Copy del landing', 'low', 'new', 'mañ.'],
                  ['Test e2e checkout', 'med', 'new', 'mié'],
                ].map(([t, p, s, d], i) => (
                  <TaskCard key={i} title={t} prio={p} state={s} due={d} dense />
                ))}
              </div>
            </SB>
            <SB style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SecHead size={16}>Proyectos activos</SecHead>
              {[['Rediseño app', 8, 14, wfTokens.hueExec], ['Marketing Q3', 3, 9, wfTokens.hueWait], ['Backend v2', 5, 11, wfTokens.hueNew]].map(([n, d, t, c], i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dot c={c} />
                    <span style={{ flex: 1, fontSize: 11 }}>{n}</span>
                    <Mono>{d}/{t}</Mono>
                  </div>
                  <div style={{ height: 5, borderRadius: 2, background: wfTokens.border, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d/t)*100}%`, background: c }} />
                  </div>
                </div>
              ))}
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

function DashboardD() {
  // Modo foco — UNA tarea grande + queue minimal
  return (
    <Page>
      <TopBar active="dashboard" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 40, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, left: 28 }}><Mono>MODO FOCO · 02:34:18 sesión</Mono></div>
          <div style={{ position: 'absolute', top: 20, right: 28, display: 'flex', gap: 6 }}>
            <Btn ghost><Ic d={I.x} size={10} /> salir</Btn>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Mono>AHORA · rediseño app · vence hoy 18:00</Mono>
            <div style={{ fontFamily: '"Caveat", cursive', fontSize: 42, color: wfTokens.text, lineHeight: 1.1 }}>
              Cerrar el diseño del onboarding y exportar especificaciones.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Prio level="high" />
              <StatePill k="exec" />
              <Tag>ux</Tag><Tag>ios</Tag>
            </div>
            {/* Subtareas */}
            <SB style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {[
                ['Wireframes paso 1-3', true],
                ['Diseño visual paso 1-3', true],
                ['Estados de error', true],
                ['Animaciones', false],
                ['Export a Figma + specs', false],
              ].map(([t, d], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check done={d} size={14} />
                  <span style={{ fontSize: 12, color: d ? wfTokens.textDim : wfTokens.text, textDecoration: d ? 'line-through' : 'none' }}>{t}</span>
                </div>
              ))}
            </SB>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 4 }}>
              <Btn primary>marcar como hecha</Btn>
              <Btn ghost>posponer</Btn>
              <Btn ghost>saltar</Btn>
            </div>
          </div>
          {/* Queue inferior */}
          <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, padding: '0 30px' }}>
            <Mono>EN COLA →</Mono>
            {[
              ['Revisar PR #482', 'exec'],
              ['Copy del landing', 'new'],
              ['Test e2e checkout', 'new'],
              ['Llamada diseño', 'wait'],
            ].map(([t, s], i) => (
              <SB key={i} style={{ padding: '5px 9px', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.7 }}>
                <StateDot k={s} size={6} />
                <span style={{ fontSize: 10 }}>{t}</span>
              </SB>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { DashboardA, DashboardB, DashboardC, DashboardD });
