---
# HANDOFF.md — Adaptive Gamer Coaching System
# READ THIS FIRST IN EVERY SESSION

## Project
Adaptive Gamer Coaching System with Rage-Quit and Addiction Prediction.
Academic: GRIET Department of Data Science, Review 3 demo.
Status: MVP build in progress.

## Architecture
- ML: scikit-learn models trained on gaming_mental_health_10M_40features.csv (1M rows, use 200k sample)
- Backend: FastAPI on localhost:8000
- Frontend: React + Vite + Tailwind v3 on localhost:5173
- No database for MVP (stateless API)

## Critical File Paths
- Dataset: ml/gaming_mental_health_10M_40features.csv
- Rage model: ml/rage_model.pkl
- Addiction model: ml/addiction_model.pkl
- Feature lists: ml/rage_features.json, ml/addiction_features.json
- Backend entry: backend/main.py
- Frontend entry: frontend/src/App.jsx

## Label Engineering (DO NOT CHANGE)
rage_quit = 1 if (aggression_score > 6.0 AND stress_level >= 7) else 0
addiction_category = pd.cut(addiction_level, bins=[-1, 3.33, 6.66, 10], labels=['Low', 'Medium', 'High'])

## Rage Model
Algorithm: Random Forest (binary classification)
Features: stress_level, anxiety_score, daily_gaming_hours, toxic_exposure,
          night_gaming_ratio, weekly_sessions, sleep_hours, aggression_score, loneliness_score

## Addiction Model
Algorithm: Gradient Boosting (multiclass: Low/Medium/High)
Features: daily_gaming_hours, weekly_sessions, night_gaming_ratio, sleep_hours,
          loneliness_score, social_interaction_score, microtransactions_spending,
          years_gaming, happiness_score, depression_score

## Coaching Logic
rage=True  + addiction=High   → ["Take a 30-min break now", "Limit to 2hr sessions", "Breathing exercises", "Talk to someone you trust"]
rage=True  + addiction=Medium → ["10 min break after loss streak", "Hydrate and stretch", "Mute toxic players"]
rage=False + addiction=High   → ["Set daily time limit", "Replace one session with outdoors", "Track your mood"]
rage=False + addiction=Medium → ["Maintain sleep schedule", "Mix in casual games"]
rage=False + addiction=Low    → ["Great balance! Keep sleep consistent", "Stay hydrated in long sessions"]

## API Endpoints
POST /predict
  Input JSON: { stress_level, anxiety_score, daily_gaming_hours, toxic_exposure,
                night_gaming_ratio, weekly_sessions, sleep_hours, aggression_score,
                loneliness_score, social_interaction_score, microtransactions_spending,
                years_gaming, happiness_score, depression_score }
  Output JSON: { rage_probability, rage_prediction, addiction_category,
                 addiction_probabilities, coaching_tips }

GET /health → { status: "ok" }

## Color Palette
bg: #0a0a0f, surface: #12121a, border: #1e1e2e
neon_green: #00ff88, neon_red: #ff2d55, purple: #7c3aed, cyan: #00d4ff
text: #e2e8f0, muted: #64748b

## Phase 2 (NOT NOW)
Riot API integration. Stub endpoint exists at POST /fetch-player.
See backend/riot_stub.py for scaffolding.

## Git Convention
Commit after every prompt completion.
Branch: main only.
---
