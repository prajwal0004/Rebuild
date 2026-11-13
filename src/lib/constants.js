export const MOODS = [['Happy','good'],['Calm','good'],['Motivated','good'],['Anxious','low'],['Lonely','low'],['Empty','low'],['Frustrated','low'],['Sad','low'],['Restless','mid'],['Overwhelmed','low']].map(([name, tone]) => ({ name, tone }));
export const moodTone = (n) => MOODS.find((m) => m.name === n)?.tone || 'none';
export const CATEGORIES = ['Sleep', 'Nutrition', 'Exercise', 'Discipline', 'Personal Growth'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
export const MAIN_MEALS = ['Breakfast', 'Lunch', 'Dinner'];
export const ACTIVITIES = ['Walking', 'Running', 'Gym', 'Home workout', 'Stretching', 'Sports', 'Other'];
export const INTENSITIES = ['Light', 'Moderate', 'Hard'];
