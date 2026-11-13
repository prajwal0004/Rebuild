import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { getHabits, listRange, recentDone, setCommitmentDone } from '../services/trackerService';
import { Err } from '../components/Nav';
import { Bars, Meter, ProgressRing } from '../components/Viz';
import { MAIN_MEALS } from '../lib/constants';
import { addDays, fmtDate, greetingIn, longDateIn, range, shortDay } from '../utils/dates';

const ORDER = ['Main Priority', 'Micro Task', 'Personal Promise'];
const hm = (t) => { const [h, m] = t.split(':'); return +h + +m / 60; };

export default function Dashboard() {
  const { profile, settings, tz, today } = useProfile();
  const { busy, run } = useAction();
  const q = useQuery(async () => {
    const wk = addDays(today, -6);
    const [checkin, habits, logs, meals, water, ex, commits, done] = await Promise.all([
      listRange('daily_checkins', 'checkin_date', today, today), getHabits(), listRange('habit_logs', 'log_date', wk, today),
      listRange('meal_logs', 'meal_date', today, today), listRange('hydration_logs', 'log_date', today, today),
      listRange('exercise_logs', 'exercise_date', today, today), listRange('daily_commitments', 'commitment_date', today, today), recentDone()]);
    return { checkin: checkin[0], habits, logs, meals, water, ex, commits, done };
  }, [today]);

  const d = q.data;
  const active = d ? d.habits.filter((h) => h.is_active) : [];
  const ids = new Set(active.map((h) => h.id));
  const doneOn = (day) => d.logs.filter((l) => l.log_date === day && l.completed && ids.has(l.habit_id)).length;
  const pct = d && active.length ? Math.round((doneOn(today) / active.length) * 100) : 0;
  const sleepTarget = ((hm(settings.wakeup_target) - hm(settings.bedtime_target)) + 24) % 24;
  const waterMl = d ? d.water.reduce((s, w) => s + w.water_ml, 0) : 0;
  const exMin = d ? d.ex.reduce((s, e) => s + e.duration_minutes, 0) : 0;
  const mealsLogged = d ? new Set(d.meals.filter((m) => MAIN_MEALS.includes(m.meal_type)).map((m) => m.meal_type)).size : 0;
  const bars = d ? range(addDays(today, -6), 7).map((day) => ({ label: shortDay(day), value: active.length ? Math.round((doneOn(day) / active.length) * 100) : 0, title: `${doneOn(day)}/${active.length} habits` })) : [];
  const commits = d ? [...d.commits].sort((a, b) => ORDER.indexOf(a.commitment_type) - ORDER.indexOf(b.commitment_type)) : [];

  return (
    <>
      <h1>{greetingIn(tz)}, {profile.display_name}</h1>
      <p className="muted">{longDateIn(tz)}</p>
      <Err q={q} />
      {!d ? <p className="muted">Loading your day…</p> : (
        <>
          <div className="grid3" style={{ marginTop: '1.25rem' }}>
            <div className="card stack"><h3>Energy &amp; mood</h3>
              {d.checkin ? (<><div className="big">{d.checkin.energy_level}<span className="muted small"> / 10 energy</span></div>
                <div className="chips"><span className="chip on">{d.checkin.mood}</span><span className="chip">Stress {d.checkin.stress_level}/10</span></div></>)
                : <p className="muted" style={{ margin: 0 }}>No check-in yet today.<br /><Link to="/check-in" className="link">Check in now</Link></p>}</div>
            <div className="card stack"><h3>Sleep</h3>
              {d.checkin?.sleep_hours != null ? (<><div className="big">{Number(d.checkin.sleep_hours)} <span className="muted small">h last night</span></div><Meter value={Number(d.checkin.sleep_hours)} max={sleepTarget} /><span className="muted small">Target about {sleepTarget.toFixed(1)} h</span></>)
                : <p className="muted" style={{ margin: 0 }}>Not recorded. Add sleep hours in your <Link to="/check-in" className="link">check-in</Link>.</p>}</div>
            <div className="card row" style={{ gap: '1.2rem' }}><ProgressRing pct={pct} label="habits" />
              <div><h3>Habits today</h3><span className="muted">{doneOn(today)} of {active.length} done</span><br /><Link to="/habits" className="link">Open tracker</Link></div></div>
            <div className="card stack"><h3>Nutrition</h3><div><b>{mealsLogged}/3</b> <span className="muted small">main meals logged</span></div>
              <Meter value={waterMl} max={settings.water_goal} /><span className="muted small">{waterMl} / {settings.water_goal} ml water</span><Link to="/nutrition" className="link">Log food or water</Link></div>
            <div className="card stack"><h3>Exercise</h3><div className="big">{exMin} <span className="muted small">/ {settings.daily_exercise_goal} min</span></div>
              <Meter value={exMin} max={settings.daily_exercise_goal} /><Link to="/exercise" className="link">Log activity</Link></div>
            <div className="card stack"><h3>Start small</h3><p className="muted" style={{ margin: 0 }}>Seven minutes is enough to begin.</p><Link to="/commitments" className="btn primary" style={{ textAlign: 'center' }}>Start 7-minute timer</Link></div>
          </div>
          <div className="grid2" style={{ marginTop: '1.25rem' }}>
            <div className="card stack"><h3>Today&rsquo;s commitments</h3>
              {!commits.length && <p className="muted" style={{ margin: 0 }}>None set yet. <Link to="/commitments" className="link">Choose your three</Link></p>}
              {commits.map((c) => (
                <button key={c.id} className={`mini${c.completed ? ' done' : ''}`} disabled={busy} onClick={() => run(() => setCommitmentDone(c.id, !c.completed), c.completed ? null : 'Done. Added to your proof history.')}>
                  {c.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span><span className="muted small">{c.commitment_type}</span><br />{c.title}</span></button>))}</div>
            <div className="card stack"><h3>Recent achievements</h3>
              {!d.done.length && <p className="muted" style={{ margin: 0 }}>Completed commitments will appear here.</p>}
              {d.done.map((c) => <div key={c.id}>{c.title} <span className="muted small">· {fmtDate(c.commitment_date)}</span></div>)}</div>
          </div>
          <div className="card stack"><h3>Habit completion, last 7 days</h3><Bars items={bars} max={100} /></div>
        </>
      )}
    </>
  );
}
