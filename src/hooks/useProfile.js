import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProfileAndSettings } from '../services/profileService';

export function useProfile() {
  const { user } = useAuth();
  const [state, setState] = useState({ profile: null, settings: null, loading: true, error: null });

  const load = useCallback(async () => {
    if (!user) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchProfileAndSettings(user.id);
      setState({ ...data, loading: false, error: null });
    } catch (e) {
      setState({ profile: null, settings: null, loading: false, error: e.message });
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
