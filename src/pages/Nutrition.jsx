import { useState } from 'react';
import { Trash2, Undo2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { addRow, addWater, deleteRow, listRange } from '../services/trackerService';
import { DateNav, Err } from '../components/Nav';
import { Meter } from '../components/Viz';
import { MAIN_MEALS, MEAL_TYPES } from '../lib/constants';
import { addDays, nowTimeIn, range, shortDay } from '../utils/dates';

export default function Nutrition() {
  const { today, tz, settings } = useProfile();
  const { busy, run } = useAction();
  const [date, setDate] = useState(today);
  const [m, setM] = useState({ meal_type: 'Breakfast', description: '', meal_time: nowTimeIn(tz), notes: '' });
  const [ml, setMl] = useState('');
  const meals = useQuery(() => listRange('meal_logs', 'meal_date', date, date), [date]);
  const water = useQuery(() => listRange('hydration_logs', 'log_date', date, date), [date]);
  const wk = useQuery(async () => {
    const f = addDays(today, -6);
    const [a, b] = await Promise.all([listRange('meal_logs', 'meal_date', f, today), listRange('hydration_logs', 'log_date', f, today)]);
    return { meals: a, water: b };
  }, [today]);

  const total = (water.data || []).reduce((s, w) => s + w.water_ml, 0);
  const logged = new Set((meals.data || []).map((x) => x.meal_type));
  const days = range(addDays(today, -6), 7);
  const wd = wk.data;
  const mainPerDay = (d) => new Set((wd?.meals || []).filter((x) => x.meal_date === d && MAIN_MEALS.includes(x.meal_type)).map((x) => x.meal_type)).size;
  const waterPerDay = (d) => (wd?.water || []).filter((x) => x.log_date === d).reduce((s, x) => s + x.water_ml, 0);
  const mealPct = Math.round((days.reduce((s, d) => s + mainPerDay(d), 0) / 21) * 100);
  const waterAvg = Math.round(days.reduce((s, d) => s + waterPerDay(d), 0) / 7);

  const addMeal = (e) => {
    e.preventDefault();
    run(() => addRow('meal_logs', { meal_date: date, meal_type: m.meal_type, description: m.description.trim() || null, meal_time: m.meal_time || null, notes: m.notes.trim() || null }), 'Meal logged')
      .then((okk) => okk && setM({ ...m, description: '', notes: '' }));
  };
  const addCustom = (e) => { e.preventDefault(); const v = parseInt(ml, 10); if (v > 0) run(() => addWater(date, v), `${v} ml added`).then((okk) => okk && setMl('')); };
  const undo = () => { const last = (water.data || []).at(-1); if (last) run(() => deleteRow('hydration_logs', last.id), 'Last entry removed'); };

  return (
    <>
      <div className="page-head"><div><h1>Nutrition</h1><p className="muted" style={{ margin: 0 }}>Regular meals and water. No calorie counting.</p></div>
        <DateNav date={date} today={today} onChange={setDate} /></div>
      <Err q={meals} /><Err q={water} />
      <div className="grid2" style={{ marginTop: '1.25rem' }}>
        <div className="stack">
          <form className="card stack" onSubmit={addMeal}>
            <h3>Log a meal</h3>
            <div className="row"><label style={{ flex: 1 }}>Type<select value={m.meal_type} onChange={(e) => setM({ ...m, meal_type: e.target.value })}>{MEAL_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Time<input type="time" value={m.meal_time} onChange={(e) => setM({ ...m, meal_time: e.target.value })} /></label></div>
            <label>What did you eat?<input value={m.description} onChange={(e) => setM({ ...m, description: e.target.value })} /></label>
            <label>Notes (optional)<input value={m.notes} onChange={(e) => setM({ ...m, notes: e.target.value })} /></label>
            <button className="btn primary" disabled={busy}>Add meal</button>
          </form>
          <div className="card stack">
            <h3>Meals</h3>
            <div className="chips">{MAIN_MEALS.map((t) => <span key={t} className={`chip${logged.has(t) ? ' on' : ''}`}>{t}: {logged.has(t) ? 'logged' : 'not logged yet'}</span>)}</div>
            {(meals.data || []).map((x) => (
              <div key={x.id} className="row" style={{ justifyContent: 'space-between' }}>
                <span><b>{x.meal_type}</b> {x.meal_time && <span className="muted small">{x.meal_time.slice(0, 5)}</span>}<br />{x.description || <span className="muted">No description</span>}{x.notes && <span className="muted small"> · {x.notes}</span>}</span>
                <button className="icon-btn" aria-label="Delete meal" disabled={busy} onClick={() => run(() => deleteRow('meal_logs', x.id), 'Meal removed')}><Trash2 size={15} /></button>
              </div>))}
            {meals.data && !meals.data.length && <p className="muted small" style={{ margin: 0 }}>Nothing logged for this day yet.</p>}
          </div>
        </div>
        <div className="stack">
          <div className="card stack">
            <h3>Water</h3>
            <div className="big">{total} <span className="muted small">/ {settings.water_goal} ml</span></div>
            <Meter value={total} max={settings.water_goal} />
            <div className="row">{[250, 500, 750].map((v) => <button key={v} className="btn" disabled={busy} onClick={() => run(() => addWater(date, v), `${v} ml added`)}>+{v} ml</button>)}
              <button className="btn" disabled={busy || !(water.data || []).length} onClick={undo}><Undo2 size={14} /> Undo</button></div>
            <form className="row" onSubmit={addCustom}><input type="number" min="1" placeholder="Custom ml" value={ml} onChange={(e) => setMl(e.target.value)} style={{ width: 130 }} /><button className="btn" disabled={busy}>Add</button></form>
          </div>
          <div className="card stack">
            <h3>Last 7 days</h3>
            <Err q={wk} />
            <div className="row" style={{ gap: '1.5rem' }}><span>Meal regularity <b>{mealPct}%</b></span><span>Avg water <b>{waterAvg} ml</b></span></div>
            <table className="grid"><thead><tr><th></th>{days.map((d) => <th key={d}>{shortDay(d)}</th>)}</tr></thead>
              <tbody><tr><td className="small muted">Meals</td>{days.map((d) => <td key={d}>{mainPerDay(d)}/3</td>)}</tr>
                <tr><td className="small muted">Water</td>{days.map((d) => <td key={d} className="small">{(waterPerDay(d) / 1000).toFixed(1)}L</td>)}</tr></tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}
