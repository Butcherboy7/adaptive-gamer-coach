// 127.0.0.1 rather than localhost: on Windows, localhost tries IPv6 first and adds ~2s per request.
export const API_BASE_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://127.0.0.1:8000';

// Inputs the model uses. `source` says where a real deployment would get each value:
// match history from the Riot API, everything else from the player's own check-in.
export const INPUTS = {
  daily_gaming_hours:         { label: 'Daily play',          min: 0, max: 16,  step: 0.5,  unit: 'h',   source: 'match', healthy: [0, 3],    hint: 'Average hours a day across all games' },
  weekly_sessions:            { label: 'Sessions per week',   min: 1, max: 50,  step: 1,    unit: '',    source: 'match', healthy: [0, 14],   hint: 'Separate times you sit down to play' },
  night_gaming_ratio:         { label: 'Play after 10 PM',    min: 0, max: 1,   step: 0.05, unit: '%',   source: 'match', healthy: [0, 0.2],  hint: 'Share of matches that start late at night' },
  sleep_hours:                { label: 'Sleep per night',     min: 3, max: 12,  step: 0.5,  unit: 'h',   source: 'self',  healthy: [7, 9],    hint: 'Average hours of sleep' },
  toxic_exposure:             { label: 'Toxic lobbies',       min: 0, max: 1,   step: 0.05, unit: '%',   source: 'self',  healthy: [0, 0.25], hint: 'Share of matches with abusive players' },
  microtransactions_spending: { label: 'Monthly spend',       min: 0, max: 500, step: 5,    unit: '$',   source: 'self',  healthy: [0, 30],   hint: 'Skins, battle passes, bundles' },
  stress_level:               { label: 'Stress',              min: 1, max: 10,  step: 1,    unit: '/10', source: 'self',  healthy: [1, 4],    hint: '1 calm, 10 overwhelmed' },
  anxiety_score:              { label: 'Anxiety',             min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [0, 4],    hint: 'Nervousness during and after play' },
  aggression_score:           { label: 'Anger after losses',  min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [0, 4],    hint: 'How heated you get when a game goes badly' },
  depression_score:           { label: 'Low mood',            min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [0, 3],    hint: 'Feeling down or flat most days' },
  happiness_score:            { label: 'Happiness',           min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [6, 10],   hint: 'Overall life satisfaction' },
  loneliness_score:           { label: 'Loneliness',          min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [0, 4],    hint: 'Feeling isolated outside the game' },
  social_interaction_score:   { label: 'Offline social life', min: 0, max: 10,  step: 0.5,  unit: '/10', source: 'self',  healthy: [6, 10],   hint: 'Time with people away from the screen' },
  years_gaming:               { label: 'Years playing',       min: 0, max: 30,  step: 1,    unit: 'y',   source: 'self',  healthy: null,      hint: 'How long you have played regularly' },
};

export const INPUT_GROUPS = [
  { id: 'match', title: 'From match history', note: 'Pulled from recent Valorant matches', keys: ['daily_gaming_hours', 'weekly_sessions', 'night_gaming_ratio'] },
  { id: 'habits', title: 'Habits', note: 'From your weekly check-in', keys: ['sleep_hours', 'toxic_exposure', 'microtransactions_spending', 'years_gaming'] },
  { id: 'mind', title: 'Mood & mind', note: 'From your weekly check-in', keys: ['stress_level', 'anxiety_score', 'aggression_score', 'depression_score', 'happiness_score'] },
  { id: 'social', title: 'Social', note: 'From your weekly check-in', keys: ['loneliness_score', 'social_interaction_score'] },
];

export const DEFAULT_VALUES = {
  stress_level: 5, anxiety_score: 5, aggression_score: 5, loneliness_score: 5,
  social_interaction_score: 5, happiness_score: 6, depression_score: 3,
  daily_gaming_hours: 3, weekly_sessions: 15, night_gaming_ratio: 0.3,
  sleep_hours: 7, toxic_exposure: 0.3, microtransactions_spending: 10, years_gaming: 3,
};

export const RANK_COLORS = {
  Iron: '#6f7378', Bronze: '#a8754c', Silver: '#b9c0c4', Gold: '#e2b04a', Platinum: '#3fb3b8',
  Diamond: '#c58cf0', Ascendant: '#3cbf7a', Immortal: '#e0566a', Radiant: '#f6e7a3',
};

export function formatValue(key, value) {
  const unit = INPUTS[key]?.unit;
  if (unit === '%') return `${Math.round(value * 100)}%`;
  if (unit === '$') return `$${Math.round(value)}`;
  if (unit === 'h') return `${value}h`;
  if (unit === '/10') return `${value}`;
  if (unit === 'y') return `${value}y`;
  return `${value}`;
}

export function rankLabel(r) {
  if (!r) return '';
  return r.tier ? `${r.rank} ${r.tier}` : r.rank;
}
