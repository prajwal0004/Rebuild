import { useState } from 'react';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useQuery } from '../hooks/useQuery';
import { useAction } from '../hooks/useAction';
import { deleteRow, listRange, saveCommitment, setCommitmentDone } from '../services/trackerService';
import { DateNav, Err } from '../components/Nav';
import StarterTimer from '../components/StarterTimer';
import { addDays, fmtShort } from '../utils/dates';

const SLOTS = [
  { type: 'Main Priority', hint: 'The one thing that matters most today.' },
  { type: 'Micro Task', hint: 'Something you can finish in under 10 minutes.' },
  { type: 'Personal Promise', hint: 'A small promise to yourself.' },
];

function Slot({ slot, item, date, run, busy }) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState('');
  const save = async (e) => { e.preventDefault(); if (!t.trim()) return; if (await run(() => saveCommitment(date, slot.type, t.trim()), 'Saved')) { setEditing(false); setT(''); } };
  if (!item || editing) return (
    <form className="slot stack" onSubmit={save} style={{ gap: '.5rem' }}>
      <div><b>{slot.type}</b><div className="muted small">{slot.hint}</div></div>
      <div className="row"><input style={{ flex: 1 }} value={t} onChange={(e) => setT(e.target.value)} placeholder="Write it in one line" />
        <button className="btn primary" disabled={busy}>Save</button>{editing && <button type="button" className="btn" onClick={() => setEditing(false)}>Cancel</button>}</div>
    </form>
  );
  return (
    <div className={`slot${item.completed ? ' done' : ''}`}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <button className="mini" style={{ flex: 1 }} disabled={busy} onClick={() => run(() => setCommitmentDone(item.id, !item.completed), item.completed ? null : 'Done. Added to your proof history.')}>
          {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          <span><span className="muted small">{slot.type}</span><br /><span className="st">{item.title}</span></span>
        </button>
        <span className="row" style={{ flexWrap: 'nowrap' }}>
          <button className="icon-btn" aria-label="Edit" onClick={() => { setT(item.title); setEditing(true); }}><Pencil size={15} /></button>
          <button className="icon-btn" aria-label="Delete" disabled={busy} onClick={() => window.confirm('Delete this commitment?') && run(() => deleteRow('daily_commitments', item.id), 'Removed')}><Trash2 size={15} /></button>
        </span>
      </div>
    </div>
  );
}

export default function Commitments() {
  const { today } = useProfile();
  const { busy, run } = useAction();
  const [date, setDate] = useState(today);
  const day = useQuery(() => listRange('daily_commitments', 'commitment_date', date, date), [date]);
  const hist = useQuery(() => listRange('daily_commitments', 'commitment_date', addDays(today, -13), today), [today]);
  const by = (t) => (day.data || []).find((c) => c.commitment_type === t);
  const kept = (day.data || []).filter((c) => c.completed).length;
  const groups = {}; (hist.data || []).forEach((c) => { (groups[c.commitment_date] ||= []).push(c); });

  return (
    <>
      <div className="page-head"><div><h1>Daily Commitments</h1><p className="muted" style={{ margin: 0 }}>Three small things. Each one you finish is proof you follow through.</p></div>
        <DateNav date={date} today={today} onChange={setDate} max={addDays(today, 1)} /></div>
      <Err q={day} />
      <div className="grid2" style={{ marginTop: '1.25rem', gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="stack">
          {SLOTS.map((s) => <Slot key={s.type + date} slot={s} item={by(s.type)} date={date} run={run} busy={busy} />)}
          <div className="card"><b>{kept} of 3 kept</b><span className="muted"> {kept === 3 ? '. A full day. Well done.' : kept > 0 ? '. Any number is progress.' : '. Start with the smallest one.'}</span></div>
        </div>
        <StarterTimer date={today} />
      </div>
      <div className="card stack">
        <h3>Last 14 days</h3>
        {Object.keys(groups).sort().reverse().map((d) => (
          <div key={d} className="row" style={{ justifyContent: 'space-between' }}>
            <span className="muted small" style={{ width: 70 }}>{fmtShort(d)}</span>
            <span style={{ flex: 1 }}>{groups[d].map((c) => <span key={c.id} className={`chip${c.completed ? ' on' : ''}`} style={{ marginRight: '.4rem' }}>{c.title}</span>)}</span>
            <b>{groups[d].filter((c) => c.completed).length}/{groups[d].length}</b>
          </div>))}
        {hist.data && !hist.data.length && <p className="muted small" style={{ margin: 0 }}>Your history will appear here.</p>}
      </div>
    </>
  );
}
