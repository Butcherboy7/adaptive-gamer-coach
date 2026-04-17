# ⚡ Adaptive Gamer Coaching System
### Behavioral Intelligence for Gamers | GRIET DS Department — Review 3

A complete Machine Learning ecosystem that predicts **Rage-Quit Risk** and **Gaming Addiction Levels** using behavioral signals. Featuring a high-performance FastAPI backend and a premium Cyberpunk-themed React dashboard.

---

## 🚀 Quick Start Guide (Local Setup)

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Python 3.9 - 3.12** (For the ML models and Backend)
- **Node.js 18+** (For the Frontend dashboard)
- **Git** (To clone the repository)

### 2. Installation & Execution

#### Step 1: Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/Butcherboy7/adaptive-gamer-coach.git
cd adaptive-gamer-coach
```

#### Step 2: Backend Setup (FastAPI)
The backend manages the model inference and data processing.
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   python backend/main.py
   ```
   *The server will start on http://localhost:8000. It pre-loads the trained `.pkl` models from the `ml/` folder automatically.*

#### Step 3: Frontend Setup (React + Vite)
The frontend provides a futuristic dashboard to visualize player data.
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser to the URL shown in the terminal (usually http://localhost:5173).*

---

## 🎮 Core Features

- **Dual Input Modes**: 
  - **Manual Input**: Fine-tune your behavioral stats using high-precision sliders.
  - **Riot ID Search**: Search from a database of over **100+ simulated Valorant pro/casual players** (e.g., TenZ#NA1, Shroud#EUW) to auto-populate the engine.
- **Real-time Analytics**: High-speed inference using Scikit-Learn.
- **Dynamic Visuals**: 
  - **Risk Gauge**: Animated probability meter for rage-quit risk.
  - **Addiction Meter**: Recharts-powered visualization of gaming habits.
  - **Stats Radar**: 360-degree plot of your mental, social, and session behavior.
- **Smart Coaching**: AI-generated tips tailored to your specific behavioral profile.

---

## 📁 Directory Structure

- `ml/`: Pre-trained models (`.pkl`), feature definitions, and the training pipeline (`train_models.py`).
- `backend/`: FastAPI server logic (`main.py`) and API cross-origin configurations.
- `frontend/`: React components, Cyberpunk UI logic, and the 100+ player dummy database.
- `api/`: Vercel serverless integration logic.

---

## 🎓 Academic Attribution
Developed for the **GRIET Department of Data Science** (SRP/RTRP Project — Review 3).
**Project Lead:** Butcherboy7
**Research Topic:** Predicting Gamer Burnout and Toxicity via Behavioral Modeling.
