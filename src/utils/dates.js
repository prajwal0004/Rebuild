// Local calendar date (YYYY-MM-DD) in the user's chosen timezone.
export function todayIn(tz = 'Asia/Kathmandu', date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function longDateIn(tz = 'Asia/Kathmandu', date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
export function greetingIn(tz = 'Asia/Kathmandu', date = new Date()) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hour12: false }).format(date)) % 24;
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// ---- pure YYYY-MM-DD helpers (no timezone drift: all math in UTC) ----
const U = (d) => new Date(d + 'T00:00:00Z');
export const addDays = (d, n) => { const t = U(d); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
export const weekStart = (d) => addDays(d, -((U(d).getUTCDay() + 6) % 7)); // Monday
export const range = (from, n) => Array.from({ length: n }, (_, i) => addDays(from, i));
export const monthStart = (d) => d.slice(0, 7) + '-01';
export const addMonths = (d, n) => { const t = U(d); t.setUTCMonth(t.getUTCMonth() + n, 1); return t.toISOString().slice(0, 10); };
export const daysInMonth = (d) => { const t = U(d); return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); };
export const diffDays = (a, b) => Math.round((U(b) - U(a)) / 864e5);
export const dayNum = (d) => Number(d.slice(8, 10));
export const monthLabel = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(U(d));
export const shortDay = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short' }).format(U(d));
export const fmtDate = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(U(d));
export const fmtShort = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' }).format(U(d));
export const nowTimeIn = (tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
