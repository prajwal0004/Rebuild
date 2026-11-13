import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useAction } from '../hooks/useAction';
import { logFocus } from '../services/trackerService';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function StarterTimer({ date, minutes = 7 }) {
  const { run } = useAction();
  const [task, setTask] = useState('');
  const [endAt, setEndAt] = useState(null);
  const [left, setLeft] = useState(minutes * 60);

  useEffect(() => {
    if (!endAt) return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(t); setEndAt(null); setLeft(minutes * 60);
        run(() => logFocus({ task_name: task.trim() || null, duration_minutes: minutes, session_type: 'starter', completed: true, session_date: date }),
          `${minutes} minutes done. You started, and that counts.`);
      }
    }, 500);
    return () => clearInterval(t);
  }, [endAt]); // eslint-disable-line

  const running = endAt !== null;
  return (
    <div className="card stack" id="timer">
      <h3>{minutes}-minute starter</h3>
      <p className="muted small" style={{ margin: 0 }}>Only commit to {minutes} minutes. Stopping afterwards is allowed.</p>
      <div className="timer">{fmt(left)}</div>
      <input placeholder="What will you start on?" value={task} disabled={running} onChange={(e) => setTask(e.target.value)} />
      {!running
        ? <button className="btn primary" onClick={() => { setLeft(minutes * 60); setEndAt(Date.now() + minutes * 60000); }}><Play size={15} /> Start</button>
        : <button className="btn" onClick={() => { setEndAt(null); setLeft(minutes * 60); }}><Square size={15} /> Stop</button>}
    </div>
  );
}
