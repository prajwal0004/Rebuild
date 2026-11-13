import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const { session, updatePassword } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    const { error } = await updatePassword(pw);
    setBusy(false);
    if (error) setMsg(error.message); else nav('/', { replace: true });
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo">REBUILD</div>
        <p className="muted">{session ? 'Choose a new password.' : 'Open the reset link from your email to continue.'}</p>
        <label>New password<input type="password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required disabled={!session} /></label>
        {msg && <div className="alert err">{msg}</div>}
        <button className="btn primary" disabled={busy || !session}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </div>
  );
}
