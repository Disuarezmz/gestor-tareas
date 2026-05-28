const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function localToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function todayISO() {
  const t = localToday();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

export function dayISO(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export function formatDue(due) {
  if (!due || due === '—') return '—';
  const d = new Date(due + 'T12:00:00');
  if (isNaN(d.getTime())) return due;
  const today = localToday();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dDay.getTime() === today.getTime()) return 'hoy';
  if (dDay.getTime() === tomorrow.getTime()) return 'mañana';
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function isDateToday(due) {
  return !!due && due !== '—' && due === todayISO();
}

export function parseISODate(due) {
  if (!due || due === '—') return null;
  const d = new Date(due + 'T12:00:00');
  if (isNaN(d.getTime())) return null;
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
}
