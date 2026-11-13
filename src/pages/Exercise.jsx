import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { addRow, deleteRow, listRange } from '../services/trackerService';
import { Err } from '../components/Nav';
import { Bars, Meter } from '../components/Viz';
import { ACTIVITIES, INTENSITIES } from '../lib/constants';
import { addDays, fmtShort, monthStart, weekStart } from '../utils/dates';

export default function Exercise() {
  const { today, settings } = useProfile();
  const { busy, run } = useAction();
  const [f, setF] = useState({ date: today, activity: 'Walking', custom: '', minutes: 30, intensity: 'Moderate', notes: '' });
  const q = useQuery(() => listRange('exercise_logs', 'exercise_date', addDays(today, -364), today), [today]);
  const logs = q.data || [];
  const sum = (a) => a.reduce((s, l) => s + l.duration_minutes, 0);
  const wk = weekStart(today);
  const inWeek = logs.filter((l) => l.exercise_date >= wk);
  const inMonth = logs.filter((l) => l.exercise_date >= monthStart(today));
  const todayMin = sum(logs.filter((l) => l.exercise_date === today));
  const byWeek = {}; logs.forEach((l) => { const k = weekStart(l.exercise_date); byWeek[k] = (byWeek[k] || 0) + l.duration_minutes; });
  const longest = Math.max(0, ...logs.map((l) => l.duration_minutes));
  const bestWeek = Math.max(0, ...Object.values(byWeek));
  const bars = Array.from({ length: 8 }, (_, i) => { const w = addDays(wk, -7 * (7 - i)); return { label: fmtShort(w), value: byWeek[w] || 0, title: `${byWeek[w] || 0} min` }; });

  const submit = (e) => {
    e.preventDefault();
    const type = f.activity === 'Other' ? f.custom.trim() : f.activity;
    if (!type) return;
    run(() => addRow('exercise_logs', { exercise_date: f.date, activity_type: type, duration_minutes: parseInt(f.minutes, 10), intensity: f.intensity, notes: f.notes.trim() || null }), 'Activity logged')
      .then((okk) => okk && setF({ ...f, notes: '', custom: '' }));
  };

  return (
    <>
      <h1>Exercise</h1><p className="muted">Any movement counts.</p>
      <Err q={q} />
      <div className="grid2" style={{ marginTop: '1.25rem' }}>
        <form className="card stack" onSubmit={submit}>
          <h3>Log activity</h3>
          <div className="row"><label style={{ flex: 1 }}>Activity<select value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })}>{ACTIVITIES.map((a) => <option key={a}>{a}</option>)}</select></label>
            <label>Date<input type="date" max={today} value={f.date} required onChange={(e) => setF({ ...f, date: e.target.value })} /></label></div>
          {f.activity === 'Other' && <label>Activity name<input value={f.custom} required onChange={(e) => setF({ ...f, custom: e.target.value })} /></label>}
          <div className="row"><label>Minutes<input type="number" min="1" max="600" required value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} style={{ width: 100 }} /></label>
            <label>Intensity<select value={f.intensity} onChange={(e) => setF({ ...f, intensity: e.target.value })}>{INTENSITIES.map((a) => <option key={a}>{a}</option>)}</select></label></div>
          <label>Notes (optional)<input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
          <button className="btn primary" disabled={busy}>Add activity</button>
        </form>
        <div className="stack">
          <div className="card stack">
            <h3>Today</h3><div className="big">{todayMin} <span className="muted small">/ {settings.daily_exercise_goal} min</span></div>
            <Meter value={todayMin} max={settings.daily_exercise_goal} />
            <div className="row" style={{ gap: '1.2rem' }}><span>Week <b>{sum(inWeek)} min</b></span><span>Active days <b>{new Set(inWeek.map((l) => l.exercise_date)).size}/7</b></span><span>Month <b>{sum(inMonth)} min</b></span></div>
          </div>
          <div className="card stack"><h3>Weekly minutes</h3><Bars items={bars} /></div>
          <div className="card"><h3>Personal records</h3>
            <p style={{ margin: 0 }}>Longest session: <b>{longest} min</b><br />Best week: <b>{bestWeek} min</b></p></div>
        </div>
      </div>
      <div className="card stack">
        <h3>Recent activity</h3>
        {[...logs].reverse().slice(0, 15).map((l) => (
          <div key={l.id} className="row" style={{ justifyContent: 'space-between' }}>
            <span><b>{l.activity_type}</b> · {l.duration_minutes} min {l.intensity && <span className="muted small">({l.intensity})</span>} <span className="muted small">{fmtShort(l.exercise_date)}{l.notes ? ' · ' + l.notes : ''}</span></span>
            <button className="icon-btn" aria-label="Delete activity" disabled={busy} onClick={() => run(() => deleteRow('exercise_logs', l.id), 'Activity removed')}><Trash2 size={15} /></button>
          </div>))}
        {q.data && !logs.length && <p className="muted small" style={{ margin: 0 }}>No activity logged yet. A five-minute walk is a fine first entry.</p>}
      </div>
    </>
  );
}
