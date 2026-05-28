import { useState, useMemo, Fragment } from 'react';
import { wfTokens, stateColor } from '../constants/tokens.js';
import { I } from '../constants/icons.js';
import { useApp } from '../contexts/AppContext.jsx';
import { HW, Mono, SB, Dot, Btn, Ic } from '../components/primitives/index.jsx';
import { PageTitle } from '../components/chrome/index.jsx';
import { parseISODate, dayISO, formatDue } from '../utils/dates.js';

const DAYS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// TODAY is hardcoded to May 28 2026 (matches the app's demo data)
const TODAY_Y = 2026, TODAY_M = 4, TODAY_D = 28; // month is 0-indexed

function getTasksForDay(day, month, year, tasks) {
  return tasks.filter((t) => {
    const d = parseISODate(t.due);
    return d && d.day === day && d.month === month && d.year === year;
  });
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
  // 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

// ── Month view ────────────────────────────────────────────────
function CalCell({ day, isToday, isPast, tasks, onTaskClick, onAdd }) {
  return (
    <div style={{
      minHeight: 90, borderRight: `1px solid ${wfTokens.borderSoft}`,
      borderBottom: `1px solid ${wfTokens.borderSoft}`,
      padding: 6, display: 'flex', flexDirection: 'column', gap: 3,
      background: isToday ? `color-mix(in oklch, var(--wf-accent) 6%, ${wfTokens.surface})` : 'transparent',
      opacity: isPast ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 22, height: 22, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isToday ? 'var(--wf-accent)' : 'transparent',
          fontSize: 11, fontWeight: isToday ? 600 : 400,
          color: isToday ? '#0e0e14' : day ? wfTokens.text : wfTokens.textDim,
        }}>
          {day || ''}
        </div>
        {day && (
          <button onClick={onAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: wfTokens.textDim, opacity: 0, transition: 'opacity 0.1s' }} className="cal-add-btn">
            <Ic d={I.plus} size={9} />
          </button>
        )}
      </div>
      {tasks.slice(0, 3).map((task) => (
        <div key={task.id} onClick={() => onTaskClick(task.id)} style={{
          fontSize: 9, padding: '2px 5px', borderRadius: 3,
          background: wfTokens.surfaceHi,
          borderLeft: `2px solid ${stateColor(task.status)}`,
          color: wfTokens.text, cursor: 'pointer',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {task.title}
        </div>
      ))}
      {tasks.length > 3 && <Mono size={8} style={{ color: wfTokens.textDim }}>+{tasks.length - 3} más</Mono>}
    </div>
  );
}

// ── Week view ─────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function WeekView({ weekStart, filtered, onTaskClick, onAdd }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Days header */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', borderBottom: `1px solid ${wfTokens.borderSoft}`, flexShrink: 0 }}>
        <div style={{ borderRight: `1px solid ${wfTokens.borderSoft}` }} />
        {days.map((d, i) => {
          const isToday = d.getFullYear() === TODAY_Y && d.getMonth() === TODAY_M && d.getDate() === TODAY_D;
          return (
            <div key={i} style={{ padding: '8px 4px', textAlign: 'center', borderRight: `1px solid ${wfTokens.borderSoft}` }}>
              <Mono size={9}>{DAYS_HEADER[i].toUpperCase()}</Mono>
              <div style={{
                width: 24, height: 24, borderRadius: 999, margin: '4px auto 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isToday ? 'var(--wf-accent)' : 'transparent',
                fontSize: 12, fontWeight: isToday ? 600 : 400,
                color: isToday ? '#0e0e14' : wfTokens.text,
              }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, 1fr)', flex: 1 }}>
        {HOURS.map((h) => (
          <Fragment key={h}>
            <div style={{ padding: '4px 6px', borderRight: `1px solid ${wfTokens.borderSoft}`, borderBottom: `1px solid ${wfTokens.borderSoft}`, height: 48, display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
              <Mono size={8}>{h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}</Mono>
            </div>
            {days.map((d, di) => {
              const dayTasks = getTasksForDay(d.getDate(), d.getMonth(), d.getFullYear(), filtered);
              const hourTasks = dayTasks.filter(() => h === 9);
              return (
                <div key={`${h}-${di}`} style={{
                  borderRight: `1px solid ${wfTokens.borderSoft}`,
                  borderBottom: `1px solid ${wfTokens.borderSoft}`,
                  height: 48, position: 'relative', padding: 2,
                  background: (d.getFullYear() === TODAY_Y && d.getMonth() === TODAY_M && d.getDate() === TODAY_D)
                    ? `color-mix(in oklch, var(--wf-accent) 4%, ${wfTokens.surface})`
                    : 'transparent',
                }}>
                  {hourTasks.map((task) => (
                    <div key={task.id} onClick={() => onTaskClick(task.id)} style={{
                      fontSize: 9, padding: '2px 5px', borderRadius: 3, marginBottom: 2,
                      background: `color-mix(in oklch, ${stateColor(task.status)} 18%, ${wfTokens.surfaceHi})`,
                      borderLeft: `2px solid ${stateColor(task.status)}`,
                      color: wfTokens.text, cursor: 'pointer',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {task.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ── Day view ──────────────────────────────────────────────────
function DayView({ date, filtered, onTaskClick }) {
  const dayTasks = getTasksForDay(date.getDate(), date.getMonth(), date.getFullYear(), filtered);
  const isToday = date.getFullYear() === TODAY_Y && date.getMonth() === TODAY_M && date.getDate() === TODAY_D;

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Day header */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${wfTokens.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isToday ? 'var(--wf-accent)' : wfTokens.surfaceHi,
          color: isToday ? '#0e0e14' : wfTokens.text,
          fontSize: 18, fontWeight: 600,
        }}>
          {date.getDate()}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: wfTokens.text }}>
            {DAYS_HEADER[(date.getDay() + 6) % 7]}, {date.getDate()} {MONTHS[date.getMonth()]}
          </div>
          <Mono>{dayTasks.length} tareas</Mono>
        </div>
      </div>

      {/* Hours */}
      <div style={{ flex: 1 }}>
        {HOURS.map((h) => {
          const hourTasks = dayTasks.filter(() => h === 9);
          return (
            <div key={h} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', borderBottom: `1px solid ${wfTokens.borderSoft}`, minHeight: 52 }}>
              <div style={{ padding: '6px 12px', borderRight: `1px solid ${wfTokens.borderSoft}` }}>
                <Mono size={9}>{h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}</Mono>
              </div>
              <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {hourTasks.map((task) => (
                  <div key={task.id} onClick={() => onTaskClick(task.id)} style={{
                    fontSize: 11, padding: '5px 10px', borderRadius: 4,
                    background: `color-mix(in oklch, ${stateColor(task.status)} 15%, ${wfTokens.surfaceHi})`,
                    borderLeft: `3px solid ${stateColor(task.status)}`,
                    color: wfTokens.text, cursor: 'pointer',
                  }}>
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function CalendarPage() {
  const { tasks, selectedProject, setOpenTaskId, openCreateTask } = useApp();
  const [view, setView] = useState('month');
  const [year, setYear] = useState(TODAY_Y);
  const [month, setMonth] = useState(TODAY_M);

  // For week/day views, track a reference date
  const [refDate, setRefDate] = useState(() => new Date(TODAY_Y, TODAY_M, TODAY_D));

  const filtered = selectedProject ? tasks.filter((t) => t.project === selectedProject) : tasks;

  // ── Month nav ─────────────────────────────────────────────
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(TODAY_Y); setMonth(TODAY_M);
    setRefDate(new Date(TODAY_Y, TODAY_M, TODAY_D));
  };

  // ── Week nav ──────────────────────────────────────────────
  const weekStart = useMemo(() => {
    const d = new Date(refDate);
    const dow = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - dow);
    return d;
  }, [refDate]);

  const prevWeek = () => setRefDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  const nextWeek = () => setRefDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
  const prevDay  = () => setRefDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const nextDay  = () => setRefDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });

  const onPrev = view === 'month' ? prevMonth : view === 'week' ? prevWeek : prevDay;
  const onNext = view === 'month' ? nextMonth : view === 'week' ? nextWeek : nextDay;

  // ── Month grid ────────────────────────────────────────────
  const cells = useMemo(() => {
    const offset = firstDayOfMonth(year, month);
    const days = daysInMonth(year, month);
    const out = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let d = 1; d <= days; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  const subtitle = view === 'month'
    ? `${MONTHS[month].charAt(0).toUpperCase() + MONTHS[month].slice(1)} ${year}`
    : view === 'week'
      ? `Semana del ${weekStart.getDate()} ${MONTHS_SHORT[weekStart.getMonth()]}`
      : `${DAYS_HEADER[(refDate.getDay() + 6) % 7]} ${refDate.getDate()} ${MONTHS[refDate.getMonth()]}`;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageTitle sub={subtitle} right={
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', borderRadius: 5, border: `1px solid ${wfTokens.border}`, overflow: 'hidden' }}>
            {['month', 'week', 'day'].map((v, i) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 12px', fontSize: 10, cursor: 'pointer', border: 'none',
                background: view === v ? wfTokens.surfaceHi : 'transparent',
                color: view === v ? wfTokens.text : wfTokens.textMuted,
                fontFamily: 'inherit',
                borderRight: i < 2 ? `1px solid ${wfTokens.borderSoft}` : 'none',
              }}>
                {['Mes', 'Semana', 'Día'][i]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Btn ghost onClick={onPrev}><Ic d={I.arrow} size={10} style={{ transform: 'rotate(180deg)' }} /></Btn>
            <Btn ghost onClick={goToday}>Hoy</Btn>
            <Btn ghost onClick={onNext}><Ic d={I.arrow} size={10} /></Btn>
          </div>
          <Btn primary onClick={() => openCreateTask()}><Ic d={I.plus} size={10} /> Tarea</Btn>
        </div>
      }>Calendario</PageTitle>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 22px 22px', display: 'flex', flexDirection: 'column' }}>
        <SB style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
          {view === 'month' && (
            <>
              {/* Days header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${wfTokens.borderSoft}`, flexShrink: 0 }}>
                {DAYS_HEADER.map((d) => (
                  <div key={d} style={{ padding: '8px 0', textAlign: 'center', borderRight: `1px solid ${wfTokens.borderSoft}` }}>
                    <Mono size={9}>{d.toUpperCase()}</Mono>
                  </div>
                ))}
              </div>
              {/* Grid */}
              <div style={{
                flex: 1, overflow: 'auto',
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gridAutoRows: 'minmax(90px, 1fr)', alignContent: 'start',
              }}>
                {cells.map((day, idx) => (
                  <CalCell
                    key={idx}
                    day={day}
                    isToday={day === TODAY_D && month === TODAY_M && year === TODAY_Y}
                    isPast={day && new Date(year, month, day) < new Date(TODAY_Y, TODAY_M, TODAY_D)}
                    tasks={day ? getTasksForDay(day, month, year, filtered) : []}
                    onTaskClick={setOpenTaskId}
                    onAdd={() => openCreateTask({ due: day ? dayISO(year, month, day) : undefined })}
                  />
                ))}
              </div>
            </>
          )}

          {view === 'week' && (
            <WeekView
              weekStart={weekStart}
              filtered={filtered}
              onTaskClick={setOpenTaskId}
              onAdd={openCreateTask}
            />
          )}

          {view === 'day' && (
            <DayView
              date={refDate}
              filtered={filtered}
              onTaskClick={setOpenTaskId}
            />
          )}
        </SB>
      </div>
    </div>
  );
}
