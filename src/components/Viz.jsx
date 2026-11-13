export function Meter({ value, max }) {
  return <div className="meter"><div style={{ width: `${Math.min(100, max ? (value / max) * 100 : 0)}%` }} /></div>;
}
export function ProgressRing({ pct = 0, size = 104, label }) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r, h = size / 2;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={h} cy={h} r={r} className="ring-bg" />
        <circle cx={h} cy={h} r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${h} ${h})`} />
      </svg>
      <div className="ring-label"><b>{pct}%</b>{label && <span className="small muted">{label}</span>}</div>
    </div>
  );
}
export function Bars({ items, max }) {
  const m = max || Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bars">
      {items.map((i) => (
        <div className="bar-col" key={i.label} title={`${i.label}: ${i.title ?? i.value}`}>
          <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.min(100, (i.value / m) * 100)}%` }} /></div>
          <span className="small muted">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
export function Spark({ data, days, max = 10 }) {
  if (!data.length) return <div className="muted small">No data this month yet.</div>;
  const W = 300, H = 70, p = 6;
  const x = (d) => p + ((d - 1) / Math.max(days - 1, 1)) * (W - 2 * p);
  const y = (v) => H - p - ((v - 1) / (max - 1)) * (H - 2 * p);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark">
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={data.map((q) => `${x(q.day)},${y(q.v)}`).join(' ')} />
      {data.map((q) => <circle key={q.day} cx={x(q.day)} cy={y(q.v)} r="2.5" fill="var(--accent)" />)}
    </svg>
  );
}
