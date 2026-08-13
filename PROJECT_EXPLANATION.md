# 🎮 Adaptive Gamer Coaching System: Detailed Project Explanation

Welcome to the comprehensive, simple-to-understand explanation of the **Adaptive Gamer Coaching System**. 

This document breaks down what this project is, why it was built, how the machine learning algorithms work under the hood, key engineering decisions from [PROJECT_DECISIONS.md](PROJECT_DECISIONS.md), and how the whole system connects together.

---

## 🎯 What is this Project? (The Big Picture)

Gamers frequently encounter stress, tilt, toxic teammates, late-night sessions, and burnout. Often, gamers don't realize they are on the verge of "rage-quitting" (slamming desk, Alt+F4, breaking peripherals) or developing unhealthy gaming addiction patterns until it's too late.

The **Adaptive Gamer Coaching System** is an AI-powered Cyberpunk Dashboard that acts like a mental coach for gamers. By asking simple questions or loading player stats (e.g., hours played daily, stress level, sleep quality, exposure to toxic players), the system instantly:
1. **Calculates Rage-Quit Probability (%)**: Predicts how likely you are to tilt or quit in frustration.
2. **Determines Addiction Risk Level**: Categorizes gaming addiction into **Low**, **Medium**, or **High**.
3. **Generates Tailored AI Coaching Tips**: Gives actionable advice (e.g., *"Take a 30-min break now"*, *"Mute toxic voice chat"*, *"Set a daily 2-hour cap"*).

---

## 🧠 Deep Learning Engine: How Does the Neural Net Work?

The project relies on **2 specialized Deep Neural Network (Multi-Layer Perceptron / MLP) models** trained on a dataset of **200,000 player records**:

```
Input Vector [8 or 10 Features]
       │
       ▼  (StandardScaler Feature Normalization)
┌──────────────┐
│  Dense-128   │  (128 Hidden Neurons + ReLU Activation + Adam Optimizer)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Dense-64   │  (64 Hidden Neurons + ReLU Activation + Dropout)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Output Layer │  (Sigmoidal Unit for Rage Risk / Softmax for Addiction Category)
└──────────────┘
```

### 1. The Deep Rage-Quit Predictor (MLP Deep Neural Net)
* **Goal**: Predict if a player will rage-quit (Yes/No and probability %).
* **Architecture**: 8 Input Nodes ➔ 128 Hidden Neurons (ReLU) ➔ 64 Hidden Neurons (ReLU) ➔ 1 Output Sigmoidal Probability.
* **Smart Anti-Cheat Feature**: `aggression_score` was **removed from input tensors**. This forced the deep neural layers to learn non-linear behavioral proxies (such as how night gaming ratio combined with toxic exposure triggers elevated cortisol).

### 2. The Deep Addiction Predictor (Multi-Class MLP Deep Neural Net)
* **Goal**: Classify gaming behavior into **Low**, **Medium**, or **High** risk categories.
* **Architecture**: 10 Input Nodes ➔ 128 Hidden Neurons (ReLU) ➔ 64 Hidden Neurons (ReLU) ➔ 3 Softmax Output Nodes.
* **Neural Loss Convergence Graph**: Tracks Cross-Entropy Loss minimization over 28 epochs using the Adam Optimizer. Evaluators can view the live **Neural Loss Graph** directly in the UI dashboard!

---

## 🏗️ System Architecture (How the Components Talk)

The application consists of two main parts:

```
    ┌─────────────────────────┐               ┌─────────────────────────┐
    │  React Frontend (Vite)  │  POST /predict│   FastAPI Python Backend │
    │  (Cyberpunk HUD UI)     ├──────────────►│   (Loads ML Models)     │
    │  Port 5173              │◄──────────────┤   Port 8000             │
    └─────────────────────────┘  JSON Results └─────────────────────────┘
```

1. **Frontend (React + Vite + Tailwind CSS)**:
   - Provides a slick Cyberpunk dark-mode user interface.
   - Interactive sliders for adjusting player stats in real-time.
   - Recharts (SVG-based) for high-performance visual gauges (Rage Arc, Addiction Meter, Stats Radar).

2. **Backend (FastAPI + Scikit-Learn)**:
   - High-speed Python web server.
   - Receives JSON statistics from the frontend, formats them into a numerical array, runs them through pickled (`.pkl`) trained models, and returns real-time predictions and coaching recommendations.

---

## 💡 Key Design Decisions & "Why" Behind Them (From `PROJECT_DECISIONS.md`)

Why did we build things the way we did? Here is the plain-language breakdown of key technical decisions from [PROJECT_DECISIONS.md](PROJECT_DECISIONS.md):

### 1. Why 200,000 rows instead of 1,000,000 rows?
* The original dataset had 1 million rows. Training on 1M rows increased laptop/server training time by **400%**, but only improved AI accuracy by less than **0.5%**. 
* 200,000 rows hit the **"sweet spot"**: super fast training with maximum accuracy.

### 2. Why Behavioral Modeling instead of Live Riot API (Valorant/League API)?
* Getting approval for a production Riot Games API key takes weeks and restricts the app to only Riot games.
* By building a **Behavioral Mental Health Model**, our project is **game-agnostic**—it works for Valorant, CS2, League of Legends, Dota 2, or any competitive game!

### 3. The ONNX Pivot & Reversion back to Scikit-Learn
* We tried converting our models to ONNX runtime to deploy on Vercel cloud serverless functions.
* However, ONNX added unnecessary complexity when retraining or tuning models. 
* **Final Choice**: We reverted back to standard **Scikit-Learn (`.pkl`) files** to ensure standard Python readability, instant local execution, and easy model inspection for academic review.

### 4. The "Seeded Random" Trick (Simulating Live Riot ID Search)
* The dashboard features a **Riot ID Search** toggle (e.g. searching `TenZ#NA1` or `Faker#KR1`).
* Instead of randomizing stats every time you search, we used a **deterministic hash based on the username string**.
* **Why?** Searching `TenZ#NA1` will *always* return the exact same consistent stats every time. This perfectly mimics a live production database cache without needing a costly cloud database!

---

## 🚀 How to Run the Project (Quick Recap)

Open **two terminal windows**:

* **Terminal 1 (Backend)**:
  ```bash
  pip install -r requirements.txt
  python backend/main.py
  ```

* **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
Open `http://localhost:5173` in your browser and experience your AI Gamer Coach!

---

## 🎓 Academic Attribution & License

* **Institution**: Mallareddy University Department of Data Science
* **Research Focus**: Predicting Gamer Burnout via Behavioral Modeling
* **License**: MIT License
