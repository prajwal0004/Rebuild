import { useProfile } from '../hooks/useProfile';
import { greetingIn, longDateIn, todayIn } from '../utils/dates';

export default function Dashboard() {
  const { profile, settings, loading, error, reload } = useProfile();
  if (loading) return <div className="muted">Loading your data…</div>;
  if (error) return <div className="alert err">Could not load your profile: {error} <button className="link" onClick={reload}>Retry</button></div>;
  const tz = profile.timezone;
  return (
    <>
      <h1>{greetingIn(tz)}, {profile.display_name}</h1>
      <p className="muted">{longDateIn(tz)} (local date {todayIn(tz)}, {tz})</p>
      <div className="card">
        <h3>Foundation is connected</h3>
        <p className="muted">Your account, profile and settings load from Supabase under row-level security. Tracking modules arrive in the next phases; this page will then show your real daily numbers.</p>
        <p>Sleep {settings.bedtime_target.slice(0, 5)} to {settings.wakeup_target.slice(0, 5)}. Exercise {settings.daily_exercise_goal} min. Focus {settings.daily_focus_goal} min. Water {settings.water_goal} ml.</p>
      </div>
    </>
  );
}
