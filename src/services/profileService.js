import { supabase } from '../lib/supabase';

export async function fetchProfileAndSettings(userId) {
  const [p, s] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_settings').select('*').eq('user_id', userId).single(),
  ]);
  if (p.error) throw p.error;
  if (s.error) throw s.error;
  return { profile: p.data, settings: s.data };
}
