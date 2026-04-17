# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | GRIET DS Department — Review 3

A complete Machine Learning ecosystem that predicts **Rage-Quit Risk** and **Gaming Addiction Levels** using behavioral signals. Featuring a high-performance FastAPI backend and a premium Cyberpunk-themed React dashboard.

---

## 🚀 Quick Start Guide (Local Setup)

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Python 3.9+** (For the ML models and Backend)
- **Node.js 18+** (For the Frontend dashboard)
- **Git** (To clone the repository)

### 2. Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Butcherboy7/adaptive-gamer-coach.git
cd adaptive-gamer-coach
```

### 3. Setup ML Models (Optional)
The pre-trained models (`.pkl`) are already included in the repository, so you can skip this step and go straight to the Backend.
If you wish to re-train the models with your own data:
```bash
cd ml
# Place 'gaming_mental_health_10M_40features.csv' in this folder
python train_models.py
cd ..
```
*Note: Retraining is only necessary if you change the dataset or label logic.*

### 4. Backend Setup (FastAPI)
1. Navigate to root: `cd adaptive-gamer-coach`
2. Install dependencies: `pip install -r requirements.txt`
3. Running locally: `python backend/main.py`
   - The server uses **Scikit-Learn** and **Joblib** to load pre-trained models.
   - **No retraining required**: The models are pre-bundled in `ml/`.

### Frontend Setup (React + Vite)
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

---

## 📁 Directory & File Breakdown

### 🧠 `ml/` (Machine Learning Core)
*   `train_models.py`: The main pipeline script. It handles data cleaning, feature engineering (labels rage-quits based on aggression/stress), and trains two models.
*   `rage_model.pkl` & `addiction_model.pkl`: The saved brain of the AI (Random Forest and Gradient Boosting models).
*   `rage_features.json` & `addiction_features.json`: Metadata defining exactly which features each model needs.

### ⚙️ `backend/` (FastAPI Server)
*   `main.py`: The engine of the system. It hosts the `/predict` endpoint, loads the ML models, and converts raw numbers into human-readable coaching tips.
*   `riot_stub.py`: (Phase 2 Scaffold) Prepared logic to connect the app directly to live Riot Games (Valorant/LoL) data.
*   `requirements.txt`: List of all Python libraries needed.

### 🎨 `frontend/` (React Dashboard)
*   `src/components/`:
    *   `PlayerForm.jsx`: The input center with interactive sliders and neon badges.
    *   `RiskGauge.jsx`: Custom SVG animation showing the "Rage Probability".
    *   `AddictionMeter.jsx`: Visual representation of lifestyle trends using Recharts.
    *   `StatsRadar.jsx`: A radar chart plotting your behavioral profile (Stress vs Sleep vs Social).
    *   `CoachingPanel.jsx`: Displays personalized, interactive advice cards.
*   `src/App.jsx`: The main controller that wires the splash screen, API calls, and layout together.
*   `tailwind.config.js`: Custom styling configuration for the Cyberpunk theme.

### 📝 Root Files
*   `README.md`: This guide.
*   `HANDOFF.md`: Technical context and architecture notes for developers.
*   `.gitignore`: Prevents temporary files (like `node_modules`) from being pushed to GitHub.

---

## 🤖 How the AI Thinks

### Label Engineering
We don't just predict data; we define behavioral archetypes:
- **Rage-Quit (Binary):** Triggered if a player's `aggression_score` is > 6.0 while their `stress_level` is high (>= 7).
- **Addiction (Multi-class):** Categorized into **Low**, **Medium**, or **High** based on daily hours, sleep deprivation, and spending habits.

### Feature Mapping
| Category | Key Signals Tracked |
| :--- | :--- |
| **Active Gaming** | Daily Hours, Weekly Sessions, Night Gaming Ratio |
| **Mental State** | Anxiety, Stress, Loneliness, Happiness |
| **Physical** | Sleep Hours, Aggression Index |
| **Social** | Social Interaction Score, Toxic Exposure |

---

---

## 🚀 Deployment to Vercel

The project is structured to be deployed as a monolithic monorepo on Vercel.

### 1. Prerequisites
- A Vercel account.
- Your code pushed to a GitHub repository.

### 2. Deployment Steps
1.  **Import Project**: Go to [Vercel](https://vercel.com/new) and import your repository.
2.  **Configuration**:
    -   **Framework Preset**: Select `Vite`.
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `frontend/dist`
3.  **Deploy**: Click **Deploy**.

### 3. How it Works
-   **Frontend**: Built as a static Vite app.
-   **Backend**: The `api/index.py` file serves as a Serverless Function for FastAPI.
-   **Routing**: Requests to `/api/*` go to the Python backend; others go to React.

---

## 🗺️ Phase 2 Roadmap
- **Live Riot API Sync:** Allow players to enter their `Riot ID#Tag` to auto-populate gaming hours and "Surrender" history.
- **Steam Integration:** Track total library time and session frequency.
- **Mental Health Chatbot:** An AI-driven companion to help de-escalate stress after a loss streak.

---

## 🎓 Academic Attribution
Developed for the **GRIET Department of Data Science** (SRP/RTRP Project — Review 3).
**Project Lead:** Butcherboy7
**Dataset Source:** Global Gaming Mental Health Survey (Sampled for local performance).
