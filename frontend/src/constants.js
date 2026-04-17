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

// Simulated player profiles with realistic behavioral traits
export const DUMMY_PLAYERS = [
  {
    riotId: "TenZ#NA1", rank: "Radiant", agent: "Jett", hours: 2100, winRate: "61%",
    presetValues: { stress_level: 6, anxiety_score: 4, aggression_score: 5, loneliness_score: 2, social_interaction_score: 8, happiness_score: 8, depression_score: 1, daily_gaming_hours: 8, weekly_sessions: 35, night_gaming_ratio: 0.4, sleep_hours: 7, toxic_exposure: 0.8, microtransactions_spending: 150, years_gaming: 10 }
  },
  {
    riotId: "Shroud#EUW", rank: "Radiant", agent: "Omen", hours: 4200, winRate: "58%",
    presetValues: { stress_level: 4, anxiety_score: 2, aggression_score: 3, loneliness_score: 3, social_interaction_score: 7, happiness_score: 8, depression_score: 2, daily_gaming_hours: 6, weekly_sessions: 20, night_gaming_ratio: 0.6, sleep_hours: 8, toxic_exposure: 0.4, microtransactions_spending: 500, years_gaming: 15 }
  },
  {
    riotId: "ToxicBoy#999", rank: "Silver", agent: "Reyna", hours: 350, winRate: "42%",
    presetValues: { stress_level: 9, anxiety_score: 8, aggression_score: 9.5, loneliness_score: 8, social_interaction_score: 2, happiness_score: 3, depression_score: 7, daily_gaming_hours: 4, weekly_sessions: 25, night_gaming_ratio: 0.9, sleep_hours: 4, toxic_exposure: 1.0, microtransactions_spending: 5, years_gaming: 2 }
  },
  {
    riotId: "ChillDude#420", rank: "Gold", agent: "Sage", hours: 600, winRate: "51%",
    presetValues: { stress_level: 2, anxiety_score: 3, aggression_score: 1, loneliness_score: 4, social_interaction_score: 6, happiness_score: 7, depression_score: 4, daily_gaming_hours: 2, weekly_sessions: 10, night_gaming_ratio: 0.2, sleep_hours: 8, toxic_exposure: 0.2, microtransactions_spending: 15, years_gaming: 4 }
  },
  {
    riotId: "NightOwl#Zzz", rank: "Diamond", agent: "Killjoy", hours: 1400, winRate: "54%",
    presetValues: { stress_level: 7, anxiety_score: 6, aggression_score: 4, loneliness_score: 6, social_interaction_score: 4, happiness_score: 5, depression_score: 5, daily_gaming_hours: 5, weekly_sessions: 15, night_gaming_ratio: 0.95, sleep_hours: 5, toxic_exposure: 0.5, microtransactions_spending: 50, years_gaming: 5 }
  },
  {
    riotId: "NewbieGG#001", rank: "Iron", agent: "Brimstone", hours: 45, winRate: "48%",
    presetValues: { stress_level: 5, anxiety_score: 6, aggression_score: 4, loneliness_score: 5, social_interaction_score: 5, happiness_score: 6, depression_score: 3, daily_gaming_hours: 1.5, weekly_sessions: 5, night_gaming_ratio: 0.1, sleep_hours: 7.5, toxic_exposure: 0.3, microtransactions_spending: 0, years_gaming: 0 }
  },
  {
    riotId: "SweatLord#VLR", rank: "Ascendant", agent: "Chamber", hours: 1800, winRate: "49%",
    presetValues: { stress_level: 8, anxiety_score: 7, aggression_score: 8, loneliness_score: 7, social_interaction_score: 3, happiness_score: 4, depression_score: 6, daily_gaming_hours: 7, weekly_sessions: 40, night_gaming_ratio: 0.7, sleep_hours: 6, toxic_exposure: 0.9, microtransactions_spending: 300, years_gaming: 7 }
  },
  {
    riotId: "CasualDad#BBQ", rank: "Bronze", agent: "Sova", hours: 200, winRate: "45%",
    presetValues: { stress_level: 3, anxiety_score: 2, aggression_score: 2, loneliness_score: 2, social_interaction_score: 9, happiness_score: 8, depression_score: 1, daily_gaming_hours: 1, weekly_sessions: 3, night_gaming_ratio: 0.1, sleep_hours: 7, toxic_exposure: 0.1, microtransactions_spending: 60, years_gaming: 20 }
  },
  {
    riotId: "TiltMachine#EU", rank: "Platinum", agent: "Phoenix", hours: 900, winRate: "47%",
    presetValues: { stress_level: 8.5, anxiety_score: 7, aggression_score: 8.5, loneliness_score: 6, social_interaction_score: 4, happiness_score: 4, depression_score: 5, daily_gaming_hours: 4.5, weekly_sessions: 20, night_gaming_ratio: 0.5, sleep_hours: 5.5, toxic_exposure: 0.8, microtransactions_spending: 20, years_gaming: 3 }
  },
  {
    riotId: "ZenMaster#JP", rank: "Immortal", agent: "Cypher", hours: 2500, winRate: "56%",
    presetValues: { stress_level: 4, anxiety_score: 4, aggression_score: 3, loneliness_score: 5, social_interaction_score: 6, happiness_score: 7, depression_score: 3, daily_gaming_hours: 5, weekly_sessions: 15, night_gaming_ratio: 0.3, sleep_hours: 8, toxic_exposure: 0.3, microtransactions_spending: 100, years_gaming: 8 }
  },
  {
    riotId: "SneakyBeaky#NA", rank: "Silver", agent: "Yoru", hours: 250, winRate: "50%",
    presetValues: { stress_level: 5, anxiety_score: 5, aggression_score: 6, loneliness_score: 6, social_interaction_score: 5, happiness_score: 5, depression_score: 4, daily_gaming_hours: 3, weekly_sessions: 12, night_gaming_ratio: 0.6, sleep_hours: 6.5, toxic_exposure: 0.6, microtransactions_spending: 10, years_gaming: 2 }
  },
  {
    riotId: "HealerMain#UWU", rank: "Gold", agent: "Skye", hours: 750, winRate: "52%",
    presetValues: { stress_level: 4, anxiety_score: 6, aggression_score: 2, loneliness_score: 5, social_interaction_score: 6, happiness_score: 6, depression_score: 4, daily_gaming_hours: 3.5, weekly_sessions: 14, night_gaming_ratio: 0.4, sleep_hours: 7, toxic_exposure: 0.4, microtransactions_spending: 40, years_gaming: 5 }
  },
  {
    riotId: "ClickHead#AIM", rank: "Diamond", agent: "Neon", hours: 1200, winRate: "53%",
    presetValues: { stress_level: 6, anxiety_score: 5, aggression_score: 7, loneliness_score: 5, social_interaction_score: 5, happiness_score: 6, depression_score: 4, daily_gaming_hours: 4, weekly_sessions: 18, night_gaming_ratio: 0.5, sleep_hours: 6.5, toxic_exposure: 0.7, microtransactions_spending: 80, years_gaming: 6 }
  },
  {
    riotId: "EcoFragger#BR", rank: "Bronze", agent: "Astra", hours: 150, winRate: "46%",
    presetValues: { stress_level: 6, anxiety_score: 5, aggression_score: 5, loneliness_score: 7, social_interaction_score: 4, happiness_score: 5, depression_score: 5, daily_gaming_hours: 2.5, weekly_sessions: 10, night_gaming_ratio: 0.8, sleep_hours: 6, toxic_exposure: 0.5, microtransactions_spending: 0, years_gaming: 1 }
  },
  {
    riotId: "LuckyCrit#OCE", rank: "Platinum", agent: "Raze", hours: 1050, winRate: "51%",
    presetValues: { stress_level: 5, anxiety_score: 4, aggression_score: 6, loneliness_score: 4, social_interaction_score: 7, happiness_score: 7, depression_score: 2, daily_gaming_hours: 3, weekly_sessions: 15, night_gaming_ratio: 0.4, sleep_hours: 7.5, toxic_exposure: 0.5, microtransactions_spending: 120, years_gaming: 4 }
  }
];
