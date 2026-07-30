export function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function parseDate(str: string) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function addWorkingDays(startStr: string, days: number) {
  const d = parseDate(startStr);
  let added = 0;
  const whole = Math.floor(days);
  while (added < whole) {
    d.setDate(d.getDate() + 1);
    if (!isWeekend(d)) added++;
  }
  return fmtDate(d);
}

export function computeEndDate(startStr: string, effort: number) {
  return addWorkingDays(startStr, effort);
}

export function fmtDisplay(str: string) {
  if (!str) return '';
  const d = parseDate(str);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function workdayRange(startStr: string, endStr: string) {
  const days: string[] = [];
  const cur = parseDate(startStr);
  const end = parseDate(endStr);
  while (cur <= end) {
    if (!isWeekend(cur)) days.push(fmtDate(new Date(cur)));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function workdaysBetween(fromStr: string, toStr: string) {
  let count = 0;
  const cur = parseDate(fromStr);
  const end = parseDate(toStr);
  while (cur < end) {
    if (!isWeekend(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function nextWorkday(dateStr: string) {
  const d = parseDate(dateStr);
  do { d.setDate(d.getDate() + 1); } while (isWeekend(d));
  return fmtDate(d);
}

export function prevWorkday(dateStr: string) {
  const d = parseDate(dateStr);
  do { d.setDate(d.getDate() - 1); } while (isWeekend(d));
  return fmtDate(d);
}

export function todayStr() {
  return fmtDate(new Date());
}
