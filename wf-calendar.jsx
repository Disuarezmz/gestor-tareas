// Calendar variations (multiple switchable views)

function CalendarSwitcher({ active }) {
  return (
    <div style={{ display: 'inline-flex', borderRadius: 5, border: `1px solid ${wfTokens.border}`, overflow: 'hidden' }}>
      {[['day','Día'],['week','Semana'],['month','Mes'],['year','Año']].map(([k, l]) => (
        <div key={k} style={{
          padding: '5px 11px', fontSize: 10,
          background: active === k ? wfTokens.surfaceHi : 'transparent',
          color: active === k ? wfTokens.text : wfTokens.textMuted,
          borderRight: k !== 'year' ? `1px solid ${wfTokens.borderSoft}` : 'none',
        }}>{l}</div>
      ))}
    </div>
  );
}

function CalendarA() {
  // Vista MES — grid completo con tareas como chips
  const days = Array.from({ length: 35 }, (_, i) => i - 3); // starts before may 1
  const tasksOnDay = {
    1: [['Standup', 'exec']],
    3: [['Demo', 'wait']],
    7: [['Sprint plan', 'exec']],
    14: [['Sketch v1', 'done']],
    17: [['Cert SSL', 'done']],
    20: [['Kick-off Q3', 'done']],
    22: [['Sketch v1 cierre', 'done']],
    24: [['Setup CI', 'done']],
    27: [['Onboarding', 'exec'], ['Revisar PR', 'exec'], ['Llamada', 'wait']],
    28: [['Cabecera landing', 'exec']],
    29: [['E2E checkout', 'new']],
    30: [['Legal copy', 'wait']],
    31: [['Demo Acme', 'new']],
  };
  return (
    <Page>
      <TopBar active="calendar" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista mensual" right={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CalendarSwitcher active="month" />
              <Btn ghost>‹ hoy ›</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Mayo 2026</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${wfTokens.borderSoft}`, borderLeft: `1px solid ${wfTokens.borderSoft}`, flex: 1, background: wfTokens.surfaceLo }}>
              {['lun','mar','mié','jue','vie','sáb','dom'].map(d => (
                <div key={d} style={{ padding: '6px 8px', borderRight: `1px solid ${wfTokens.borderSoft}`, borderBottom: `1px solid ${wfTokens.borderSoft}` }}>
                  <Mono size={9} color={wfTokens.textDim}>{d.toUpperCase()}</Mono>
                </div>
              ))}
              {days.map((d, i) => {
                const inMonth = d >= 1 && d <= 31;
                const dayTasks = tasksOnDay[d] || [];
                const isToday = d === 27;
                return (
                  <div key={i} style={{
                    minHeight: 0, padding: 6,
                    borderRight: `1px solid ${wfTokens.borderSoft}`,
                    borderBottom: `1px solid ${wfTokens.borderSoft}`,
                    background: isToday ? `color-mix(in oklch, var(--wf-accent) 8%, ${wfTokens.surfaceLo})` : 'transparent',
                    opacity: inMonth ? 1 : 0.35,
                    display: 'flex', flexDirection: 'column', gap: 3,
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontSize: 10, color: isToday ? wfTokens.text : wfTokens.textMuted,
                        fontFamily: '"JetBrains Mono", monospace',
                        background: isToday ? 'var(--wf-accent)' : 'transparent',
                        color: isToday ? '#0e0e14' : wfTokens.textMuted,
                        padding: isToday ? '1px 5px' : 0,
                        borderRadius: 3,
                      }}>{inMonth ? String(d).padStart(2,'0') : (d<1 ? 27+d : d-31)}</span>
                    </div>
                    {dayTasks.slice(0,3).map(([t, s], j) => (
                      <div key={j} style={{
                        fontSize: 9, padding: '2px 5px', borderRadius: 3,
                        background: `color-mix(in oklch, ${stateColor(s)} 22%, transparent)`,
                        color: wfTokens.text,
                        borderLeft: `2px solid ${stateColor(s)}`,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{t}</div>
                    ))}
                    {dayTasks.length > 3 && <Mono size={8}>+{dayTasks.length - 3} más</Mono>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function CalendarB() {
  // SEMANA — timeline horizontal con franjas horarias
  const days = [['lun','25'],['mar','26'],['mié','27',true],['jue','28'],['vie','29'],['sáb','30'],['dom','31']];
  const hours = ['08','10','12','14','16','18','20'];
  const events = [
    // [day_idx, start_pct, height_pct, label, state]
    [0, 10, 18, 'Standup', 'exec'],
    [0, 40, 25, 'Diseño sprint', 'exec'],
    [1, 30, 30, 'Sprint plan', 'exec'],
    [2, 5, 12, 'Standup', 'exec'],
    [2, 30, 35, 'Onboarding rediseño', 'exec'],
    [2, 70, 15, 'Llamada diseño', 'wait'],
    [3, 15, 30, 'Cabecera landing', 'exec'],
    [3, 60, 20, 'Review PR', 'exec'],
    [4, 5, 15, 'Standup', 'exec'],
    [4, 30, 40, 'E2E checkout', 'new'],
    [5, 20, 30, 'Demo Acme', 'new'],
  ];
  return (
    <Page>
      <TopBar active="calendar" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista semanal" right={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CalendarSwitcher active="week" />
              <Btn ghost>‹ semana ›</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Semana 22 · mayo</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', borderTop: `1px solid ${wfTokens.borderSoft}`, borderLeft: `1px solid ${wfTokens.borderSoft}` }}>
              <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, borderBottom: `1px solid ${wfTokens.borderSoft}`, height: 40 }} />
              {days.map(([d, n, today], i) => (
                <div key={i} style={{ padding: '6px 8px', borderRight: `1px solid ${wfTokens.borderSoft}`, borderBottom: `1px solid ${wfTokens.borderSoft}`, background: today ? `color-mix(in oklch, var(--wf-accent) 10%, transparent)` : 'transparent' }}>
                  <Mono size={9} color={wfTokens.textDim}>{d.toUpperCase()}</Mono>
                  <div style={{
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 16, marginTop: 2,
                    color: today ? wfTokens.text : wfTokens.textMuted,
                  }}>{n}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', flex: 1, position: 'relative', borderLeft: `1px solid ${wfTokens.borderSoft}` }}>
              <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, position: 'relative' }}>
                {hours.map((h, i) => (
                  <div key={h} style={{ position: 'absolute', top: `${(i/(hours.length-1))*100}%`, transform: 'translateY(-50%)', right: 4 }}>
                    <Mono size={8}>{h}</Mono>
                  </div>
                ))}
              </div>
              {days.map((_, di) => (
                <div key={di} style={{ borderRight: `1px solid ${wfTokens.borderSoft}`, position: 'relative', backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 28px, ${wfTokens.borderSoft} 28px 29px)` }}>
                  {events.filter(e => e[0] === di).map(([, s, h, l, st], ei) => (
                    <div key={ei} style={{
                      position: 'absolute', left: 3, right: 3,
                      top: `${s}%`, height: `${h}%`,
                      background: `color-mix(in oklch, ${stateColor(st)} 22%, ${wfTokens.surface})`,
                      borderLeft: `2px solid ${stateColor(st)}`,
                      borderRadius: 4, padding: 5,
                      fontSize: 9, color: wfTokens.text,
                      overflow: 'hidden',
                    }}>{l}</div>
                  ))}
                </div>
              ))}
              {/* Now line */}
              <div style={{ position: 'absolute', left: '40px', right: 0, top: '45%', height: 1, background: 'var(--wf-accent)' }}>
                <div style={{ position: 'absolute', left: -3, top: -3, width: 7, height: 7, borderRadius: 999, background: 'var(--wf-accent)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function CalendarC() {
  // AÑO heatmap (panorámico)
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return (
    <Page>
      <TopBar active="calendar" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista anual · panorámica" right={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CalendarSwitcher active="year" />
              <Btn ghost>‹ 2026 ›</Btn>
            </div>
          }>Año completo</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {months.map((m, mi) => {
              const isCurrent = mi === 4;
              return (
                <SB key={m} style={{ padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                    <HW size={16} color={isCurrent?wfTokens.text:wfTokens.textMuted}>{m}</HW>
                    <Mono size={8}>{[12,8,15,9,14,11,3,2,7,18,9,6][mi]} tareas</Mono>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {['l','m','x','j','v','s','d'].map(d => (
                      <Mono key={d} size={7} style={{ textAlign: 'center' }}>{d}</Mono>
                    ))}
                    {Array.from({ length: 35 }).map((_, di) => {
                      const day = di - 2;
                      const inMonth = day >= 1 && day <= 30;
                      if (!inMonth) return <div key={di} />;
                      const seed = (mi * 7 + day * 3) % 13;
                      const intensity = seed > 10 ? 1 : seed > 7 ? 0.7 : seed > 4 ? 0.4 : seed > 2 ? 0.15 : 0;
                      const isToday = isCurrent && day === 27;
                      return (
                        <div key={di} style={{
                          aspectRatio: '1/1',
                          background: intensity === 0 ? wfTokens.surfaceHi : `color-mix(in oklch, var(--wf-accent) ${intensity*100}%, ${wfTokens.surfaceHi})`,
                          borderRadius: 1.5,
                          outline: isToday ? `1.5px solid ${wfTokens.text}` : 'none',
                          outlineOffset: 0.5,
                        }} />
                      );
                    })}
                  </div>
                </SB>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

function CalendarD() {
  // DÍA — foco con mini cal lateral + agenda detallada
  return (
    <Page>
      <TopBar active="calendar" />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <PageTitle sub="vista de un día · agenda detallada" right={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CalendarSwitcher active="day" />
              <Btn ghost>‹ hoy ›</Btn>
              <Btn primary><Ic d={I.plus} size={10} /> tarea</Btn>
            </div>
          }>Miércoles 27 mayo</PageTitle>
          <div style={{ padding: '0 22px 22px', flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 14 }}>
            {/* Mini cal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SB style={{ padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <HW size={14}>mayo</HW>
                  <div style={{ flex: 1 }} />
                  <Mono size={9}>‹ ›</Mono>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                  {['l','m','x','j','v','s','d'].map(d => <Mono key={d} size={8} style={{ textAlign: 'center' }}>{d}</Mono>)}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const d = i - 3;
                    const inMonth = d >= 1 && d <= 31;
                    const isToday = d === 27;
                    return (
                      <div key={i} style={{
                        aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: isToday ? '#0e0e14' : inMonth ? wfTokens.textMuted : wfTokens.textDim,
                        background: isToday ? 'var(--wf-accent)' : 'transparent', borderRadius: 3,
                      }}>{inMonth ? d : ''}</div>
                    );
                  })}
                </div>
              </SB>
              <SB style={{ padding: 10 }}>
                <SecHead size={13}>Vencen pronto</SecHead>
                {[['28 may','Cabecera landing','exec'],['29 may','E2E checkout','new'],['30 may','Legal copy','wait']].map(([d,t,s],i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                    <StateDot k={s} size={6} />
                    <Mono size={8} style={{ width: 36 }}>{d}</Mono>
                    <span style={{ fontSize: 10, color: wfTokens.textMuted }}>{t}</span>
                  </div>
                ))}
              </SB>
            </div>
            {/* Agenda */}
            <SB style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {[
                ['09:00','10:00','Standup','exec','Backend v2'],
                ['10:30','12:00','Onboarding rediseño','exec','Rediseño app'],
                ['12:00','13:00','Pausa comida',null,null],
                ['13:00','14:30','Revisar PR #482','exec','Backend v2'],
                ['16:00','16:45','Llamada con diseño','wait','Rediseño app'],
                ['17:30','19:00','Copy landing','new','Marketing Q3'],
              ].map(([s, e, t, st, proj], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: i<5?`1px solid ${wfTokens.borderSoft}`:'none', background: i===0?'rgba(255,255,255,0.02)':'transparent' }}>
                  <div style={{ width: 60, flexShrink: 0 }}>
                    <Mono size={10} color={wfTokens.text}>{s}</Mono>
                    <div><Mono size={8}>{e}</Mono></div>
                  </div>
                  <div style={{ width: 3, borderRadius: 2, background: st ? stateColor(st) : wfTokens.border }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: wfTokens.text, marginBottom: 3 }}>{t}</div>
                    {proj && <Mono size={9}>{proj}</Mono>}
                  </div>
                  {st && <StatePill k={st} />}
                </div>
              ))}
            </SB>
            {/* Side panel - selected task */}
            <SB style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Mono>SELECCIONADA</Mono>
              <HW size={20}>Onboarding rediseño</HW>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <StatePill k="exec" /><Prio level="high" /><Tag>ux</Tag><Tag>ios</Tag>
              </div>
              <Lines widths={[100,90,75]} c={wfTokens.borderSoft} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <Mono>SUBTAREAS · 3/5</Mono>
                {[true,true,true,false,false].map((d,i)=>(
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check done={d} size={9} />
                    <L w={['72%','85%','60%','78%','68%'][i]} h={5} c={d?wfTokens.borderSoft:wfTokens.border} />
                  </div>
                ))}
              </div>
              <Btn primary style={{ marginTop: 'auto' }}>abrir tarea</Btn>
            </SB>
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { CalendarA, CalendarB, CalendarC, CalendarD });
