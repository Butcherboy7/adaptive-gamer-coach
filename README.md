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

1. **Manual Mode**: Use the interactive sliders to adjust gaming and psychological stats (Stress, Sleep, Toxic Exposure, etc.).
2. **Riot Search**: Click the toggle at the top and type a name like `TenZ#NA1` or `Shroud#EUW`. This uses a deterministic hash to return consistent player profiles to mock a production caching system.
3. **Analyze**: Click the **ANALYZE PLAYER** button to view AI-generated coaching tips, predictive analytics charts, and breakdown metrics.

---

## 🛠️ System Architecture & ML Details

```
                               ┌───────────────────┐
                               │   Vite + React    │  (Port 5173)
                               │  (Cyberpunk HUD)  │
                               └─────────┬─────────┘
                                         │  POST /predict
                                         ▼
                               ┌───────────────────┐
                               │  FastAPI Backend  │  (Port 8000)
                               └─────────┬─────────┘
                                         │  Loads
                                         ▼
                             ┌──────────────────────┐
                             │    Scikit-Learn      │  (Version 1.5.2)
                             │   Pickled Models     │
                             └──────────────────────┘
```

### Models & Feature Engineering
- **Rage-Quit Predictor (Random Forest Classifier)**:
  - **Ground Truth**: A gamer is flagged as rage-quitting when `stress_level >= 7` and `aggression_score > 6.0`.
  - **Features Used**: `stress_level`, `anxiety_score`, `daily_gaming_hours`, `toxic_exposure`, `night_gaming_ratio`, `weekly_sessions`, `sleep_hours`, `loneliness_score`.
  - **Note on Integrity**: `aggression_score` is intentionally excluded from the model features to prevent a tautological model, forcing the Random Forest to learn the behavioral proxies of aggression and stress.
- **Addiction Predictor (Gradient Boosting Classifier)**:
  - **Ground Truth**: Binned into three categories (`Low`, `Medium`, `High`) based on the survey's `addiction_level`.
  - **Features Used**: `daily_gaming_hours`, `weekly_sessions`, `night_gaming_ratio`, `sleep_hours`, `loneliness_score`, `social_interaction_score`, `microtransactions_spending`, `years_gaming`, `happiness_score`, `depression_score`.

---

## ⚠️ Important Troubleshooting Note
This project uses pickled machine learning models (`.pkl` files) which are version-sensitive:
- **`scikit-learn` version is pinned to `1.5.2`**. Installing other versions of scikit-learn (e.g., `1.6+` or `1.9+`) will cause the application to fail to unpickle the estimators with a `No module named '_loss'` error.
- Always use `pip install -r requirements.txt` to ensure the correct environment setup.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/malla/Desktop/adaptive%20gamer%20coach/LICENSE) file for details.

## 🎓 Academic Attribution
- **Course**: GRIET Data Science - Review 3
- **Research**: Predicting Gamer Burnout via Behavioral Modeling
- **Project Lead**: Butcherboy7
