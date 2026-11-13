import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { getCheckins, saveCheckin, deleteCheckin } from '../services/trackerService';
import { DateNav, MonthNav, Err } from '../components/Nav';
import MonthGrid from '../components/MonthGrid';
import { Spark } from '../components/Viz';
import { MOODS, moodTone } from '../lib/constants';
import { reflect } from '../utils/reflect';
import { addDays, addMonths, daysInMonth, monthStart } from '../utils/dates';

const blank = { energy_level: 5, stress_level: 5, mood: 'Calm', sleep_hours: '', fatigue_level: 5, hunger_level: 3, restlessness_level: 3, physical_condition: '', emotional_notes: '' };
const Range = ({ label, value, onChange }) => (
  <label>{label}: <b style={{ color: 'var(--text)' }}>{value}</b>
    <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(+e.target.value)} /></label>
);

export default function CheckIn() {
  const { today } = useProfile();
  const { busy, run } = useAction();
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(monthStart(today));
  const [f, setF] = useState(blank);
  const day = useQuery(() => getCheckins(date, date), [date]);
  const mq = useQuery(() => getCheckins(month, addDays(addMonths(month, 1), -1)), [month]);
  const saved = day.data?.[0];
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (day.loading) return;
    const c = saved;
    setF(c ? { energy_level: c.energy_level, stress_level: c.stress_level, mood: c.mood, sleep_hours: c.sleep_hours ?? '', fatigue_level: c.fatigue_level ?? 5,
      hunger_level: c.hunger_level ?? 3, restlessness_level: c.restlessness_level ?? 3, physical_condition: c.physical_condition ?? '', emotional_notes: c.emotional_notes ?? '' } : blank);
  }, [day.data, day.loading]); // eslint-disable-line

  const submit = (e) => {
    e.preventDefault();
    run(() => saveCheckin(date, { ...f, sleep_hours: f.sleep_hours === '' ? null : Number(f.sleep_hours),
      physical_condition: f.physical_condition.trim() || null, emotional_notes: f.emotional_notes.trim() || null }), 'Check-in saved');
  };
  const del = () => window.confirm('Delete this check-in?') && run(() => deleteCheckin(saved.id), 'Check-in deleted');

  const rows = mq.data || [];
  const avg = (k) => { const v = rows.map((r) => r[k]).filter((x) => x != null).map(Number); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '–'; };
  const counts = {}; rows.forEach((r) => { counts[r.mood] = (counts[r.mood] || 0) + 1; });
  const byDate = Object.fromEntries(rows.map((r) => [r.checkin_date, r]));
  const spark = (k) => rows.map((r) => ({ day: +r.checkin_date.slice(8), v: r[k] }));

  return (
    <>
      <div className="page-head"><div><h1>Emotional Check-in</h1><p className="muted" style={{ margin: 0 }}>Notice how you feel. There are no wrong answers.</p></div>
        <DateNav date={date} today={today} onChange={setDate} /></div>
      <Err q={day} />
      <div className="grid2" style={{ marginTop: '1.25rem' }}>
        <form className="card stack" onSubmit={submit}>
          <Range label="Energy" value={f.energy_level} onChange={(v) => set('energy_level', v)} />
          <div><div className="small muted" style={{ marginBottom: '.4rem' }}>Mood</div>
            <div className="chips">{MOODS.map((m) => <button type="button" key={m.name} className={`chip${f.mood === m.name ? ' on' : ''}`} onClick={() => set('mood', m.name)}>{m.name}</button>)}</div></div>
          <Range label="Stress" value={f.stress_level} onChange={(v) => set('stress_level', v)} />
          <Range label="Physical fatigue" value={f.fatigue_level} onChange={(v) => set('fatigue_level', v)} />
          <Range label="Hunger" value={f.hunger_level} onChange={(v) => set('hunger_level', v)} />
          <Range label="Restlessness" value={f.restlessness_level} onChange={(v) => set('restlessness_level', v)} />
          <label>Sleep last night (hours)<input type="number" step="0.25" min="0" max="24" value={f.sleep_hours} onChange={(e) => set('sleep_hours', e.target.value)} /></label>
          <label>Physical condition<input value={f.physical_condition} onChange={(e) => set('physical_condition', e.target.value)} placeholder="e.g. sore back, headache, fine" /></label>
          <label>Emotional notes<textarea rows="4" value={f.emotional_notes} onChange={(e) => set('emotional_notes', e.target.value)} /></label>
          <div className="row">
            <button className="btn primary" disabled={busy || day.loading}>{saved ? 'Update check-in' : 'Save check-in'}</button>
            {saved && <button type="button" className="btn" disabled={busy} onClick={del}><Trash2 size={15} /> Delete</button>}
          </div>
        </form>
        <div className="stack">
          {saved && (
            <div className="card"><h3>Reflection</h3>
              {reflect(saved).map((l, i) => <p key={i} style={{ margin: '0 0 .5rem' }}>{l}</p>)}
              <p className="muted small" style={{ margin: 0 }}>These are gentle observations, not a diagnosis. If heavy feelings last for weeks, consider talking to a professional or someone you trust.</p></div>
          )}
          <div className="card stack">
            <MonthNav month={month} maxMonth={monthStart(today)} onChange={setMonth} />
            <MonthGrid month={month} today={today} selected={date} onSelect={setDate}
              cell={(d) => byDate[d] ? { tone: moodTone(byDate[d].mood), text: byDate[d].mood.slice(0, 4) } : null} />
            <Err q={mq} />
            <div className="row" style={{ gap: '1.2rem' }}>
              <span>Check-ins <b>{rows.length}</b></span><span>Energy <b>{avg('energy_level')}</b></span><span>Stress <b>{avg('stress_level')}</b></span><span>Sleep <b>{avg('sleep_hours')}h</b></span>
            </div>
            <div className="chips">{Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([m, n]) => <span key={m} className="chip">{m} ×{n}</span>)}</div>
            <div><div className="small muted">Energy this month</div><Spark data={spark('energy_level')} days={daysInMonth(month)} /></div>
            <div><div className="small muted">Stress this month</div><Spark data={spark('stress_level')} days={daysInMonth(month)} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
