export const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:8000';

export const SLIDER_CONFIG = {
  stress_level:            { min: 1,    max: 10,   step: 1,    label: 'Stress Level',            tooltip: 'Your overall perceived stress while gaming (1=calm, 10=overwhelming)',           section: 'mental' },
  anxiety_score:           { min: 0,    max: 10,   step: 0.1,  label: 'Anxiety Score',            tooltip: 'How anxious or nervous you feel during and after gaming sessions',              section: 'mental' },
  aggression_score:        { min: 0,    max: 10,   step: 0.1,  label: 'Aggression Score',         tooltip: 'How aggressively you tend to play or react to losses (0=calm, 10=very angry)',  section: 'mental' },
  loneliness_score:        { min: 0,    max: 10,   step: 0.1,  label: 'Loneliness Score',         tooltip: 'How lonely you feel in daily life (0=very social, 10=very isolated)',           section: 'social' },
  social_interaction_score:{ min: 0,    max: 10,   step: 0.1,  label: 'Social Interaction',       tooltip: 'Quality of real-world social interactions outside gaming (0=none, 10=high)',    section: 'social' },
  happiness_score:         { min: 0,    max: 10,   step: 0.1,  label: 'Happiness Score',          tooltip: 'General life happiness level (0=very unhappy, 10=very happy)',                  section: 'social' },
  depression_score:        { min: 0,    max: 10,   step: 0.1,  label: 'Depression Score',         tooltip: 'Level of depressive symptoms experienced (0=none, 10=severe)',                  section: 'mental' },
  daily_gaming_hours:      { min: 0,    max: 16,   step: 0.5,  label: 'Daily Gaming Hours',       tooltip: 'Average hours per day spent gaming',                                            section: 'session' },
  weekly_sessions:         { min: 1,    max: 50,   step: 1,    label: 'Weekly Sessions',          tooltip: 'Number of distinct gaming sessions per week',                                   section: 'session' },
  night_gaming_ratio:      { min: 0,    max: 1,    step: 0.05, label: 'Night Gaming Ratio',       tooltip: 'Proportion of gaming done after 10pm (0=never, 1=always)',                     section: 'session' },
  sleep_hours:             { min: 3,    max: 14,   step: 0.5,  label: 'Sleep Hours',              tooltip: 'Average hours of sleep per night',                                              section: 'session' },
  toxic_exposure:          { min: 0,    max: 1,    step: 0.05, label: 'Toxic Exposure',           tooltip: 'How often you encounter toxic/abusive players (0=never, 1=constantly)',        section: 'session' },
  microtransactions_spending: { min: 0, max: 500,  step: 5,    label: 'Monthly Spending ($)',     tooltip: 'Average monthly spending on in-game purchases and microtransactions',           section: 'session' },
  years_gaming:            { min: 0,    max: 30,   step: 1,    label: 'Years Gaming',             tooltip: 'How many years you have been gaming regularly',                                 section: 'session' },
};

export const SECTIONS = {
  session: { label: 'Session Behavior', icon: '🎮' },
  mental:  { label: 'Mental State',     icon: '🧠' },
  social:  { label: 'Social Factors',   icon: '👥' },
};

export const DEFAULT_VALUES = {
  stress_level: 5,
  anxiety_score: 5,
  aggression_score: 5,
  loneliness_score: 5,
  social_interaction_score: 5,
  happiness_score: 6,
  depression_score: 3,
  daily_gaming_hours: 3,
  weekly_sessions: 15,
  night_gaming_ratio: 0.3,
  sleep_hours: 7,
  toxic_exposure: 0.3,
  microtransactions_spending: 10,
  years_gaming: 3,
};
