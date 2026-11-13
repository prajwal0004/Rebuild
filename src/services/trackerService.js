import { supabase } from '../lib/supabase';

const notify = () => window.dispatchEvent(new Event('rebuild:data'));
const ok = ({ data, error }) => { if (error) throw error; return data; };
async function uid() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Your session expired. Please sign in again.');
  return data.session.user.id;
}
const mut = async (q) => { const r = ok(await q); notify(); return r; };

// Generic reads/writes (RLS scopes everything to the signed-in user)
export const listRange = async (table, col, from, to) =>
  ok(await supabase.from(table).select('*').gte(col, from).lte(col, to).order(col).order('created_at'));
export const addRow = async (table, row) => mut(supabase.from(table).insert({ ...row, user_id: await uid() }));
export const deleteRow = (table, id) => mut(supabase.from(table).delete().eq('id', id));

// Check-ins
export const getCheckins = (from, to) => listRange('daily_checkins', 'checkin_date', from, to);
export const saveCheckin = async (date, f) =>
  mut(supabase.from('daily_checkins').upsert({ ...f, user_id: await uid(), checkin_date: date }, { onConflict: 'user_id,checkin_date' }));
export const deleteCheckin = (id) => deleteRow('daily_checkins', id);

// Habits
export const getHabits = async () => ok(await supabase.from('habits').select('*').order('created_at'));
export const saveHabit = async (h) => {
  if (h.id) { const { id, ...rest } = h; return mut(supabase.from('habits').update(rest).eq('id', id)); }
  return mut(supabase.from('habits').insert({ ...h, user_id: await uid() }));
};
export const toggleHabit = async (habit_id, log_date, completed) =>
  mut(supabase.from('habit_logs').upsert({ user_id: await uid(), habit_id, log_date, completed }, { onConflict: 'habit_id,log_date' }));

// Commitments
export const saveCommitment = async (date, type, title) =>
  mut(supabase.from('daily_commitments').upsert(
    { user_id: await uid(), commitment_date: date, commitment_type: type, title },
    { onConflict: 'user_id,commitment_date,commitment_type' }));
export const setCommitmentDone = (id, done) =>
  mut(supabase.from('daily_commitments').update({ completed: done, completed_at: done ? new Date().toISOString() : null }).eq('id', id));
export const recentDone = async () =>
  ok(await supabase.from('daily_commitments').select('*').eq('completed', true).order('completed_at', { ascending: false }).limit(5));

// Water / focus
export const addWater = (date, water_ml) => addRow('hydration_logs', { log_date: date, water_ml });
export const logFocus = (row) => addRow('focus_sessions', row);
