// Gentle, rule-based observations. Not a diagnosis.
export function reflect(c) {
  const out = [];
  if (c.stress_level >= 8) out.push('Stress is high today. Slowing down is a fair response, not a failure.');
  if (c.energy_level <= 3) out.push('Energy is low. Food, water or a short walk can help before you judge the day.');
  if (c.sleep_hours != null && c.sleep_hours !== '' && Number(c.sleep_hours) < 6) out.push('Short sleep makes everything feel heavier. Keep today\u2019s goals small.');
  if (c.hunger_level >= 7) out.push('You are quite hungry. Eating may change how you feel more than you expect.');
  if (c.restlessness_level >= 7) out.push('Restlessness often eases with movement. Even five minutes counts.');
  if (['Lonely', 'Empty', 'Sad'].includes(c.mood)) out.push('These feelings are real, and they shift. A short message to one person is a good small step.');
  if (['Anxious', 'Overwhelmed'].includes(c.mood)) out.push('Choose just one thing, then take one slow breath before it.');
  if (!out.length) out.push('Thanks for checking in. Noticing how you feel is the habit that matters most.');
  return out;
}
