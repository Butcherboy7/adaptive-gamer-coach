# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | Review 3 Submission

A high-tech dashboard that predicts **Rage-Quit Risk** and **Gaming Addiction** using Machine Learning. This project helps gamers balance their mental well-being with their gaming sessions through data-driven recommendations and cognitive coaching tips.

---

## 🚀 Easy Setup Guide

To run this project, you need to open **TWO terminal windows** side-by-side.

### 1. Start the Backend (The AI Engine)
**In Terminal 1**, run these commands from the root directory:

1. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Start the server:**
   ```bash
   python backend/main.py
   ```
*✅ **What to look for:** You should see a message saying `SUCCESS: All models loaded successfully`.*

---

### 2. Start the Frontend (The Visual Dashboard)
**Open a NEW terminal (Terminal 2)**, navigate to the `frontend/` folder, and run:

1. **Enter the frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install the visual tools:**
   ```bash
   npm install
   ```
3. **Launch the dashboard:**
   ```bash
   npm run dev
   ```
*✅ **What to look for:** A link will appear (e.g., http://localhost:5173). Ctrl + Click that link to open your dashboard!*

---

## 🎮 How to use the Dashboard

1. **Search a Riot ID** in the top bar (press `/` to jump to it). Try `kyuu#0711`, `sleepy jett#zzz`, `tilted tom#lol` or `별빛#KR1`. The player database has 144 Valorant players across NA, EU, AP, KR, BR and LATAM; any other Riot ID gets a stable generated profile.
2. The **player card** shows rank, K/D, HS%, ACS, win rate, agents, the last 10 matches (surrenders flagged) and when they play by hour.
3. The **report** runs automatically and updates live as you drag any slider:
   - **Verdict**: one plain-English sentence, the explanation, and the first thing to do.
   - **Scores**: tilt (rage-quit) probability and addiction level, with the model's confidence per level.
   - **What's driving your score**: every factor against its healthy range, plus how many points it adds to tilt and to addiction (Shapley values from the real models). Open a factor for why it matters and how to fix it.
   - **Recovery plan**: Today / Weeks 1–2 / Weeks 3–6, and a week-by-week step-down schedule for daily play.
   - **If you follow the plan**: the same models re-run on the plan's targets, so you can see the predicted improvement.
   - **Warning signs & support**: WHO gaming-disorder overlap (not a diagnosis) and free helplines.
4. No Riot ID? Choose **Or enter your own numbers** on the start screen.
5. Deep link straight to a player: `http://localhost:5173/?player=kyuu%230711`.

> All player profiles come from a synthetic dataset, not real accounts.

---

## 🛠️ Deep Learning Architecture & Neural Network Details

```
                               ┌───────────────────┐
                               │   Vite + React    │  (Port 5173)
                               │ (Broadcast HUD)   │
                               └─────────┬─────────┘
                                         │  POST /predict
                                         ▼
                               ┌───────────────────┐
                               │  FastAPI Backend  │  (Port 8000)
                               └─────────┬─────────┘
                                         │  Inference
                                         ▼
                             ┌──────────────────────┐
                             │ Deep Neural Network  │  (Multi-Layer Perceptron)
                             │   Pickled Models     │  Dense-128 -> ReLU -> Dense-64
                             └──────────────────────┘
```

### Models (Multi-Layer Perceptrons, scikit-learn)
Both models are trained by `ml/train_deep_learning.py` on 22,000 synthetic, population-shaped player profiles (80/20 train/test split). Run `cd ml && python train_deep_learning.py` to retrain.

- **Tilt / rage-quit model**: 9 inputs (stress, anxiety, anger after losses, daily hours, toxic lobbies, late-night play, sessions, sleep, loneliness) → Dense-128 → Dense-64 → probability. Labels are sampled from a documented risk function in the training script, so every input has a real effect. Test accuracy 79.7%, ROC-AUC 0.86 (the noisy labels cap any model at about 79%).
- **Addiction model**: 10 inputs (daily hours, sessions, late-night play, sleep, loneliness, offline social life, spending, years playing, happiness, low mood) → Dense-128 → Dense-64 → Low / Medium / High. Test accuracy 92.6%, macro-F1 0.91.
- **Factor impacts**: sampled Shapley values against a healthy baseline profile (`backend/coaching.py`). Each factor's points are its average contribution to the model output across random orderings, and they sum to the gap between the player and the healthy baseline.
- **Coaching engine**: `backend/coaching.py` writes the verdict, per-factor advice, phased plan, step-down schedule and projected outcome from the player's own numbers.
- **Player database**: `backend/players.py` generates each player from a behavioural archetype, so Valorant stats, match history and wellbeing answers stay consistent.

### API
| Endpoint | Purpose |
| :--- | :--- |
| `GET /health` | Model status |
| `GET /players/search?q=` | Search players by Riot ID |
| `GET /players/lookup?riot_id=` | Full player profile |
| `POST /predict` | Predictions, attributions, plan and projection |

---

## ⚠️ Important Troubleshooting Note
This project uses pickled machine learning models (`.pkl` files) which are version-sensitive:
- **`scikit-learn` version is pinned to `1.5.2`**. Installing other versions of scikit-learn (e.g., `1.6+` or `1.9+`) will cause the application to fail to unpickle the estimators with a `No module named '_loss'` error.
- Always use `pip install -r requirements.txt` to ensure the correct environment setup.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Attribution
- **Course**: Mallareddy University, Department of CSE - Review 3
- **Research**: Predicting Gamer Burnout via Behavioral Modeling
- **Lead Developer**: Abdullah
