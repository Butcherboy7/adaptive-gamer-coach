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

// Plain words for the two ends of each slider.
const WORD_ENDS = {
  stress_level: ['Calm', 'Overwhelmed'],
  anxiety_score: ['Relaxed', 'Anxious'],
  aggression_score: ['Cool', 'Furious'],
  depression_score: ['Fine', 'Very low'],
  happiness_score: ['Unhappy', 'Happy'],
  loneliness_score: ['Connected', 'Isolated'],
  social_interaction_score: ['Alone', 'Lots of people'],
  night_gaming_ratio: ['Never', 'Always'],
  toxic_exposure: ['Never', 'Always'],
};
export const INPUT_ENDS = Object.fromEntries(
  Object.entries(INPUTS).map(([k, c]) => [k, WORD_ENDS[k] || [formatValueLater(k, c.min), formatValueLater(k, c.max)]]),
);
function formatValueLater(key, value) { return formatValue(key, value); }

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
  Iron: '#6b7076', Bronze: '#94603a', Silver: '#7d8890', Gold: '#b3830a', Platinum: '#1f8f94',
  Diamond: '#8e4fc4', Ascendant: '#1f8f55', Immortal: '#c23a50', Radiant: '#a8891f',
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

export function statusOf(cfg, v) {
  if (!cfg.healthy) return 'neutral';
  const [lo, hi] = cfg.healthy;
  if (v >= lo && v <= hi) return 'healthy';
  const gap = v > hi ? v - hi : lo - v;
  return gap <= 0.15 * (cfg.max - cfg.min) ? 'watch' : 'risk';
}

// Manual entry asks six questions; these inputs are worked out from them (assumptions of the
// app, not learned by the model, which was trained on independent inputs), the rest stay typical.
export const DERIVED_FROM = {
  weekly_sessions: 'hours you play a day',
  sleep_hours: 'late-night play',
  anxiety_score: 'stress',
  depression_score: 'how happy you feel',
  social_interaction_score: 'loneliness',
};
export const TYPICAL_KEYS = ['toxic_exposure', 'microtransactions_spending', 'years_gaming'];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const half = (v) => Math.round(v * 2) / 2;

export function deriveValues(a) {
  return {
    ...DEFAULT_VALUES,
    daily_gaming_hours: a.daily_gaming_hours,
    night_gaming_ratio: a.night_gaming_ratio,
    stress_level: a.stress_level,
    aggression_score: a.aggression_score,
    happiness_score: a.happiness_score,
    loneliness_score: a.loneliness_score,
    weekly_sessions: clamp(Math.round((a.daily_gaming_hours * 7) / 1.5), 1, 50),
    sleep_hours: clamp(half(8.5 - 3.5 * a.night_gaming_ratio), 3, 12),
    anxiety_score: clamp(half(a.stress_level * 0.9), 0, 10),
    depression_score: clamp(half((10 - a.happiness_score) * 0.6), 0, 10),
    social_interaction_score: clamp(half(10 - a.loneliness_score), 0, 10),
  };
}
