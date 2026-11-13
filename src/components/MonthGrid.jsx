import { dayNum, daysInMonth } from '../utils/dates';
const HEAD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthGrid({ month, today, selected, onSelect, cell, allowFuture }) {
  const lead = (new Date(month + 'T00:00:00Z').getUTCDay() + 6) % 7;
  const pre = month.slice(0, 8);
  const days = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth(month) }, (_, i) => pre + String(i + 1).padStart(2, '0'))];
  return (
    <div className="month">
      {HEAD.map((h) => <div key={h} className="mh">{h}</div>)}
      {days.map((d, i) => {
        if (!d) return <div key={'b' + i} />;
        const c = cell?.(d) || {};
        return (
          <button key={d} type="button" disabled={!allowFuture && d > today} onClick={() => onSelect?.(d)}
            className={`mcell tone-${c.tone || 'none'}${d === selected ? ' sel' : ''}${d === today ? ' today' : ''}`}
            style={c.alpha != null ? { background: `rgba(127,168,138,${0.08 + c.alpha * 0.5})` } : undefined}>
            <span>{dayNum(d)}</span><em>{c.text || ''}</em>
          </button>
        );
      })}
    </div>
  );
}
