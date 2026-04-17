# Adaptive Gamer Coaching System
## Behavioral Intelligence for Gamers

A machine learning system that predicts rage-quit risk and addiction level from gaming behavior stats, with personalized coaching recommendations.

### Stack
- **ML**: scikit-learn (Random Forest + Gradient Boosting)
- **Backend**: FastAPI + Uvicorn
- **Frontend**: React + Vite + Tailwind CSS v3 + Recharts

### Quick Start
```bash
# Train models (run once)
cd ml && python train_models.py

# Start backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Start frontend
cd frontend && npm install && npm run dev
```

### Models
- **Rage-Quit Predictor**: Random Forest binary classifier
- **Addiction Risk Predictor**: Gradient Boosting multiclass classifier
- **Coaching Engine**: Rule-based recommendation system

### Features
- Dark cyberpunk gaming UI
- Real-time prediction from behavioral inputs
- Personalized coaching tips
- Phase 2: Riot API integration (planned)
