# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | Review 3 Submission

A high-tech dashboard that predicts **Rage-Quit Risk** and **Gaming Addiction** using Machine Learning. This project helps gamers balance their mental well-being with their gaming sessions through data-driven recommendations and cognitive coaching tips.

---

## 🚀 How to Run

### What you need
- **Python 3.10 – 3.13**: check with `python --version`
- **Node.js 20 or newer**: check with `node --version`

You will run **two terminals**: one for the backend (the AI models) and one for the frontend (the website). Keep both open while you use the app.

### Step 1: Backend (Terminal 1)
Open a terminal in the project folder and run these commands, depending on your system:

**Windows (PowerShell or CMD)**
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python backend/main.py
```

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python backend/main.py
```

✅ **It's working when** you see `SUCCESS: All Deep Learning MLP models, scalers, and loss histories loaded`. The server runs at http://127.0.0.1:8000.

> If PowerShell blocks `activate`, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, then try again.

### Step 2: Frontend (Terminal 2)
Open a **second** terminal in the project folder and run:

```bash
cd frontend
npm install
npm run dev
```

✅ **It's working when** a link appears: http://localhost:5173. Open it in your browser.

### Running it again later
You only need to install things once. After that:

| Terminal 1 (backend) | Terminal 2 (frontend) |
| :--- | :--- |
| `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux) | `cd frontend` |
| `python backend/main.py` | `npm run dev` |

To stop either one, press `Ctrl + C` in its terminal.

### Common problems
| Problem | Fix |
| :--- | :--- |
| Website says *"Can't reach the analysis server"* | The backend isn't running. Start Step 1 in its own terminal. |
| A model loading error | Make sure `ml/mlp_weights.json` exists. If you retrained, run `python export_weights.py` in `ml/`. |
| `'python' is not recognized` | Install Python from python.org and tick **"Add Python to PATH"**. On macOS/Linux use `python3`. |
| `npm` is not recognized | Install Node.js (LTS) from nodejs.org, then reopen the terminal. |
| Port 8000 or 5173 is already in use | Close the other terminal that is already running it, or restart your computer. |

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
Both models are trained by `ml/train_deep_learning.py` on 22,000 synthetic, population-shaped player profiles (80/20 train/test split). See *How the models run* below to retrain.

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

## ⚙️ How the models run
The models are trained with scikit-learn, then exported to `ml/mlp_weights.json` and run by the API with plain NumPy (`backend/mlp.py`, which gives exactly the same predictions). The server therefore doesn't need scikit-learn, which keeps the Vercel function well under its size limit.

To retrain (optional):
```bash
pip install -r ml/requirements.txt
cd ml
python train_deep_learning.py
```
This uses the pinned `scikit-learn==1.5.2` and re-exports `mlp_weights.json` automatically.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Attribution
- **Course**: Mallareddy University, Department of CSE - Review 3
- **Research**: Predicting Gamer Burnout via Behavioral Modeling
- **Lead Developer**: Abdullah
