import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Droplets } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { addWater, getHabits, listRange, setCommitmentDone } from '../services/trackerService';

const ORDER = ['Main Priority', 'Micro Task', 'Personal Promise'];

export default function RightPanel() {
  const { today, settings } = useProfile();
  const { busy, run } = useAction();
  const q = useQuery(async () => {
    const [c, h, l] = await Promise.all([
      listRange('daily_commitments', 'commitment_date', today, today), getHabits(), listRange('habit_logs', 'log_date', today, today)]);
    return { c: c.sort((a, b) => ORDER.indexOf(a.commitment_type) - ORDER.indexOf(b.commitment_type)), h, l };
  }, [today]);
  const d = q.data;
  const active = d ? d.h.filter((x) => x.is_active) : [];
  const done = d ? d.l.filter((x) => x.completed && active.some((h) => h.id === x.habit_id)).length : 0;
  return (
    <>
      <h3>Today&rsquo;s priorities</h3>
      {d && !d.c.length && <p className="muted small">Nothing planned yet. <Link to="/commitments" className="link">Set today&rsquo;s three</Link></p>}
      <div className="stack" style={{ gap: '.4rem' }}>
        {d?.c.map((c) => (
          <button key={c.id} className={`mini${c.completed ? ' done' : ''}`} disabled={busy}
            onClick={() => run(() => setCommitmentDone(c.id, !c.completed), c.completed ? null : 'Done. Added to your proof history.')}>
            {c.completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}<span>{c.title}</span>
          </button>
        ))}
      </div>
      <h3 style={{ marginTop: '1.5rem' }}>Habits</h3>
      <p className="muted small" style={{ margin: 0 }}>{d ? `${done} of ${active.length} done today` : '…'}</p>
      <h3 style={{ marginTop: '1.5rem' }}>Personal targets</h3>
      <p className="muted small" style={{ margin: 0 }}>
        Bedtime {settings.bedtime_target.slice(0, 5)}<br />Wake up {settings.wakeup_target.slice(0, 5)}<br />
        Water {settings.water_goal} ml<br />Exercise {settings.daily_exercise_goal} min<br />Focus {settings.daily_focus_goal} min
      </p>
      <h3 style={{ marginTop: '1.5rem' }}>Quick actions</h3>
      <div className="stack" style={{ gap: '.4rem' }}>
        <Link to="/check-in" className="btn">Check in</Link>
        <Link to="/nutrition" className="btn">Log a meal</Link>
        <Link to="/commitments" className="btn">Start 7-minute timer</Link>
        <button className="btn" disabled={busy} onClick={() => run(() => addWater(today, 250), '250 ml added')}><Droplets size={15} /> +250 ml water</button>
      </div>
    </>
  );
}
