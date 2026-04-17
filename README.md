# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | GRIET DS Department — Review 3

A machine learning system that predicts rage-quit risk and addiction level from gaming behavior,
with personalized coaching recommendations. Dark cyberpunk gaming dashboard UI.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Dataset: `gaming_mental_health_10M_40features.csv` in `ml/` folder

### 1. Train the Models
```bash
cd ml
pip install pandas numpy scikit-learn joblib
python train_models.py
# Expected: ~3-5 min, produces rage_model.pkl + addiction_model.pkl
```

### 2. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## 🤖 ML Models

| Model | Algorithm | Type | Features | Target |
|-------|-----------|------|----------|--------|
| Rage-Quit Predictor | Random Forest | Binary | 9 behavioral signals | rage_quit (0/1) |
| Addiction Predictor | Gradient Boosting | Multiclass | 10 lifestyle signals | Low / Medium / High |
| Coaching Engine | Rule-based | N/A | Prediction outputs | Personalized tips |

### Label Engineering
```python
# Rage-quit: emotional dysregulation proxy
rage_quit = 1 if (aggression_score > 6.0 AND stress_level >= 7) else 0
# Expected positive rate: ~20-25%

# Addiction: holistic gaming dependency level
addiction_category = pd.cut(addiction_level, bins=[-1, 3.33, 6.66, 10], labels=['Low','Medium','High'])
```

---

## 🎨 UI Features
- Dark cyberpunk theme (`#0a0a0f` background + neon colors)
- Glitch text animation on splash screen
- Animated SVG semicircular gauge for rage risk
- Recharts AreaChart for 7-day addiction trend
- Recharts RadarChart for behavioral profile
- Staggered card animations for coaching tips
- Live color-changing slider badges
- Loading overlay with cycling status text
- Error state banner
- Mobile responsive layout

---

## 📡 API

### `POST /predict`
**Input:** 14 behavioral/lifestyle float values  
**Output:** `rage_probability`, `rage_risk_level`, `addiction_category`, `coaching_tips`, `input_summary`

### `GET /health`
Returns: model load status + feature lists

### `POST /fetch-player` *(Phase 2 stub)*
Riot API integration — auto-computes features from match history

---

## 🗺️ Phase 2: Riot API Integration

**What Riot API gives us:**
- `completionState: "Surrendered"` → direct rage-quit signal
- Match duration → `daily_gaming_hours`
- Match timestamps → `night_gaming_ratio`
- Match count → `weekly_sessions`

**What always requires self-report:**
- `sleep_hours`, `anxiety_score`, `depression_score`, `loneliness_score`

**Architecture:** Player enters Riot ID → backend fetches last 20 matches →
auto-fills computable fields → player adds mental health fields → `/predict` runs normally

---

## 📁 Project Structure
```
adaptive-gamer-coach/
├── ml/
│   ├── train_models.py          # Full training pipeline
│   ├── rage_features.json       # Feature list for rage model
│   └── addiction_features.json  # Feature list for addiction model
├── backend/
│   ├── main.py                  # FastAPI app + endpoints
│   ├── riot_stub.py             # Phase 2 Riot API scaffold
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx              # Main layout + wiring
│       ├── constants.js         # Config + slider definitions
│       └── components/
│           ├── PlayerForm.jsx   # Slider form
│           ├── RiskGauge.jsx    # SVG semicircle gauge
│           ├── AddictionMeter.jsx # Pills + area chart
│           ├── StatsRadar.jsx   # Recharts radar
│           └── CoachingPanel.jsx # Staggered tip cards
├── HANDOFF.md                   # AI session context (read first!)
└── README.md
```

---

## 🎓 Academic Context
- **Project:** Adaptive Gamer Coaching System with Rage-Quit and Addiction Prediction
- **Department:** GRIET Department of Data Science
- **Type:** SRP/RTRP Project — Review 3
- **Dataset:** `gaming_mental_health_10M_40features.csv` (1M rows, 39 features)
