import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useQuery } from '../hooks/useQuery';
import { fetchProfileAndSettings } from '../services/profileService';
import { todayIn } from '../utils/dates';

const Ctx = createContext(null);
export const useProfile = () => useContext(Ctx);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const q = useQuery(() => fetchProfileAndSettings(user.id), [user.id]);
  if (q.error && !q.data) return <div className="splash"><div className="alert err">Could not load your profile: {q.error} <button className="link" onClick={q.reload}>Retry</button></div></div>;
  if (!q.data) return <div className="splash">Loading…</div>;
  const { profile, settings } = q.data;
  const tz = profile.timezone;
  return <Ctx.Provider value={{ profile, settings, tz, today: todayIn(tz), reload: q.reload }}>{children}</Ctx.Provider>;
}
