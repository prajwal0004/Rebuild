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
