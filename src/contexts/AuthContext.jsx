import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s); // expired/invalid sessions arrive as null -> ProtectedRoute redirects to login
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(() => ({
    session, user: session?.user ?? null, loading, recovering,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, displayName) => supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
    }),
    resetPassword: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }),
    updatePassword: async (password) => { const r = await supabase.auth.updateUser({ password }); if (!r.error) setRecovering(false); return r; },
    signOut: () => supabase.auth.signOut(),
  }), [session, loading, recovering]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
