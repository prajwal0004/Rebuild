import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isConfigured } from '../lib/supabase';

const ALLOW_SIGNUP = import.meta.env.VITE_ALLOW_SIGNUP !== 'false';

export default function AuthPage() {
  const { session, signIn, signUp, resetPassword } = useAuth();
  const loc = useLocation();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  if (session) return <Navigate to={loc.state?.from || '/'} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const go = (m) => () => { setMode(m); setMsg(null); };

  async function submit(e) {
    e.preventDefault();
    if (busy) return; // prevent duplicate submissions
    setBusy(true); setMsg(null);
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password);
        if (error) throw error;
      } else if (mode === 'register') {
        const { data, error } = await signUp(form.email, form.password, form.name);
        if (error) throw error;
        if (!data.session) setMsg({ ok: true, text: 'Account created. Check your email to verify it, then sign in.' });
      } else {
        const { error } = await resetPassword(form.email);
        if (error) throw error;
        setMsg({ ok: true, text: 'If that email has an account, a reset link is on its way.' });
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo">REBUILD</div>
        <p className="muted">
          {mode === 'login' && 'Welcome back. Pick up where you left off.'}
          {mode === 'register' && 'Create your private account.'}
          {mode === 'forgot' && 'We will email you a reset link.'}
        </p>
        {!isConfigured && <div className="alert err">Supabase is not configured. Copy .env.example to .env and add your project URL and publishable key.</div>}
        {mode === 'register' && <label>Name<input value={form.name} onChange={set('name')} required autoComplete="name" /></label>}
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        {mode !== 'forgot' && (
          <label>Password<input type="password" minLength={8} value={form.password} onChange={set('password')} required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        )}
        {msg && <div className={`alert ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
        <button className="btn primary" disabled={busy || !isConfigured}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
        </button>
        <div className="auth-links">
          {mode !== 'login' && <button type="button" className="link" onClick={go('login')}>Back to sign in</button>}
          {mode === 'login' && <button type="button" className="link" onClick={go('forgot')}>Forgot password?</button>}
          {mode === 'login' && ALLOW_SIGNUP && <button type="button" className="link" onClick={go('register')}>Create account</button>}
        </div>
      </form>
    </div>
  );
}
