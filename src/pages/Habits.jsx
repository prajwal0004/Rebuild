import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { getHabits, listRange, saveHabit, toggleHabit } from '../services/trackerService';
import { MonthNav, Err } from '../components/Nav';
import MonthGrid from '../components/MonthGrid';
import { Meter } from '../components/Viz';
import { CATEGORIES } from '../lib/constants';
import { addDays, addMonths, dayNum, diffDays, fmtShort, monthStart, range, shortDay, weekStart } from '../utils/dates';

export default function Habits() {
  const { today } = useProfile();
  const { busy, run } = useAction();
  const [ws, setWs] = useState(weekStart(today));
  const [month, setMonth] = useState(monthStart(today));
  const [form, setForm] = useState(null);
  const habits = useQuery(getHabits, []);
  const week = useQuery(() => listRange('habit_logs', 'log_date', ws, addDays(ws, 6)), [ws]);
  const mon = useQuery(() => listRange('habit_logs', 'log_date', month, addDays(addMonths(month, 1), -1)), [month]);
  const l30 = useQuery(() => listRange('habit_logs', 'log_date', addDays(today, -29), today), [today]);

  const all = [...(habits.data || [])].sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.created_at.localeCompare(b.created_at) || a.title.localeCompare(b.title));
  const active = all.filter((h) => h.is_active);
  const activeIds = new Set(active.map((h) => h.id));
  const key = (id, d) => id + '|' + d;
  const done = new Set((week.data || []).filter((l) => l.completed).map((l) => key(l.habit_id, l.log_date)));
  const days = range(ws, 7);
  const elapsed = days.filter((d) => d <= today).length;
  const weekDone = active.reduce((n, h) => n + days.filter((d) => d <= today && done.has(key(h.id, d))).length, 0);
  const weekPct = active.length && elapsed ? Math.round((weekDone / (active.length * elapsed)) * 100) : 0;

  const perDay = {};
  (mon.data || []).forEach((l) => { if (l.completed && activeIds.has(l.habit_id)) perDay[l.log_date] = (perDay[l.log_date] || 0) + 1; });
  const stats = active.map((h) => {
    const created = h.created_at.slice(0, 10), start = addDays(today, -29);
    const since = created > start ? created : start;
    const tracked = diffDays(since, today) + 1;
    const n = (l30.data || []).filter((l) => l.habit_id === h.id && l.completed && l.log_date >= since).length;
    return { h, n, tracked, pct: Math.round((n / tracked) * 100) };
  });

  const saveForm = (e) => {
    e.preventDefault();
    run(() => saveHabit({ ...(form.id ? { id: form.id } : {}), title: form.title.trim(), category: form.category, description: form.description?.trim() || null }), 'Habit saved')
      .then((okk) => okk && setForm(null));
  };

  return (
    <>
      <div className="page-head"><div><h1>Habit Tracker</h1><p className="muted" style={{ margin: 0 }}>Consistency over perfection. A missed day is just a blank cell.</p></div>
        <button className="btn primary" onClick={() => setForm({ title: '', category: 'Discipline', description: '' })}>New habit</button></div>
      <Err q={habits} />
      {form && (
        <form className="card stack" onSubmit={saveForm}>
          <h3>{form.id ? 'Edit habit' : 'New habit'}</h3>
          <label>Title<input value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Description (optional)<input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="row"><button className="btn primary" disabled={busy}>Save</button><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      <div className="card">
        <div className="page-head">
          <div className="datenav">
            <button className="icon-btn" aria-label="Previous week" onClick={() => setWs(addDays(ws, -7))}><ChevronLeft size={18} /></button>
            <strong>{fmtShort(ws)} &ndash; {fmtShort(addDays(ws, 6))}</strong>
            <button className="icon-btn" aria-label="Next week" disabled={ws >= weekStart(today)} onClick={() => setWs(addDays(ws, 7))}><ChevronRight size={18} /></button>
          </div>
          <span className="muted">This week: <b style={{ color: 'var(--text)' }}>{weekPct}%</b></span>
        </div>
        <Err q={week} />
        {!active.length && !habits.loading ? <p className="muted">No active habits. Create one above.</p> : (
          <table className="grid"><thead><tr><th>Habit</th>{days.map((d) => <th key={d} className={d === today ? 'today' : ''}>{shortDay(d)}<br /><span className="muted small">{dayNum(d)}</span></th>)}<th>Week</th></tr></thead>
            <tbody>{active.map((h) => (
              <tr key={h.id}><td>{h.title}<div className="muted small">{h.category}</div></td>
                {days.map((d) => { const on = done.has(key(h.id, d)); return (
                  <td key={d}><button className={`tick${on ? ' on' : ''}`} disabled={d > today || busy} aria-label={`${h.title} ${d}`} onClick={() => run(() => toggleHabit(h.id, d, !on))}>{on && <Check size={14} />}</button></td>); })}
                <td>{days.filter((d) => done.has(key(h.id, d))).length}/7</td></tr>))}</tbody></table>
        )}
      </div>
      <div className="grid2" style={{ marginTop: '1.25rem' }}>
        <div className="card stack">
          <MonthNav month={month} maxMonth={monthStart(today)} onChange={setMonth} />
          <MonthGrid month={month} today={today} cell={(d) => d > today || !active.length ? null : { alpha: (perDay[d] || 0) / active.length, text: perDay[d] ? `${perDay[d]}/${active.length}` : '' }} />
          <Err q={mon} />
        </div>
        <div className="card stack">
          <h3>Last 30 days</h3>
          {stats.map(({ h, n, tracked, pct }) => (
            <div key={h.id}><div className="row" style={{ justifyContent: 'space-between' }}><span>{h.title}</span><span className="muted small">{n}/{tracked} days · {pct}%</span></div><Meter value={n} max={tracked} /></div>
          ))}
        </div>
      </div>
      <div className="card stack">
        <h3>Manage habits</h3>
        {all.map((h) => (
          <div key={h.id} className="row" style={{ justifyContent: 'space-between', opacity: h.is_active ? 1 : .55 }}>
            <span>{h.title} <span className="muted small">({h.category}{h.is_active ? '' : ', archived'})</span></span>
            <span className="row">
              <button className="btn" onClick={() => setForm({ id: h.id, title: h.title, category: h.category, description: h.description || '' })}>Edit</button>
              <button className="btn" disabled={busy} onClick={() => run(() => saveHabit({ id: h.id, is_active: !h.is_active }), h.is_active ? 'Habit archived. History is kept.' : 'Habit restored')}>{h.is_active ? 'Archive' : 'Restore'}</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
