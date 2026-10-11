"""
Adaptive Gamer Coaching System — FastAPI Backend
Run: python backend/main.py (or uvicorn main:app --reload --port 8000)
Loads Deep Neural Network (MLP) models & Scalers for Behavioral Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import json
import numpy as np
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from backend.coaching import build_report  # imported as a package (Vercel api/index.py)
    from backend import players
except ImportError:
    from coaching import build_report          # run directly: python backend/main.py
    import players

# ─────────────────────────────────────────────
# PATH SETUP
# ─────────────────────────────────────────────
BACKEND_DIR = Path(__file__).parent
ML_DIR = BACKEND_DIR.parent / "ml"

# ─────────────────────────────────────────────
# LOAD DEEP LEARNING MODELS & SCALERS ON STARTUP
# ─────────────────────────────────────────────
print("Loading Deep Neural Network Models (MLP Architecture)...")

try:
    rage_model = joblib.load(ML_DIR / "rage_model.pkl")
    addiction_model = joblib.load(ML_DIR / "addiction_model.pkl")
    scaler_rage = joblib.load(ML_DIR / "scaler_rage.pkl")
    scaler_addiction = joblib.load(ML_DIR / "scaler_addiction.pkl")
    label_encoder = joblib.load(ML_DIR / "addiction_label_encoder.pkl")
    
    with open(ML_DIR / "rage_features.json") as f:
        RAGE_FEATURES = json.load(f)
    with open(ML_DIR / "addiction_features.json") as f:
        ADDICTION_FEATURES = json.load(f)
    with open(ML_DIR / "deep_learning_meta.json") as f:
        DL_META = json.load(f)
    
    print("SUCCESS: All Deep Learning MLP models, scalers, and loss histories loaded")
    MODELS_LOADED = True
except Exception as e:
    print(f"ERROR: Deep Learning model loading failed: {e}")
    MODELS_LOADED = False
    rage_model = addiction_model = scaler_rage = scaler_addiction = label_encoder = None
    RAGE_FEATURES = ADDICTION_FEATURES = []
    DL_META = {}

# ─────────────────────────────────────────────
# COACHING LOGIC
# ─────────────────────────────────────────────
COACHING_TIPS = {
    (True, 'High'): [
        {"text": "Take a 30-min break right now", "category": "break", "icon": "🛑"},
        {"text": "Limit sessions to 2 hours maximum", "category": "gameplay", "icon": "🎮"},
        {"text": "Try box breathing: 4 counts in, hold, 4 out", "category": "mental", "icon": "🧠"},
        {"text": "Talk to someone you trust about how you're feeling", "category": "mental", "icon": "🧠"},
    ],
    (True, 'Medium'): [
        {"text": "Take a 10-min break after every loss streak", "category": "break", "icon": "🛑"},
        {"text": "Drink water and stretch your hands/neck", "category": "health", "icon": "💧"},
        {"text": "Mute or block toxic players immediately", "category": "gameplay", "icon": "🎮"},
    ],
    (False, 'High'): [
        {"text": "Set a daily gaming time limit and stick to it", "category": "gameplay", "icon": "🎮"},
        {"text": "Replace one gaming session with outdoor activity", "category": "health", "icon": "💧"},
        {"text": "Start tracking your mood before and after sessions", "category": "mental", "icon": "🧠"},
    ],
    (False, 'Medium'): [
        {"text": "Maintain a consistent sleep schedule around gaming", "category": "health", "icon": "💧"},
        {"text": "Mix in casual/co-op games to reduce pressure", "category": "gameplay", "icon": "🎮"},
    ],
    (False, 'Low'): [
        {"text": "Great balance! Keep your sleep schedule consistent", "category": "health", "icon": "💧"},
        {"text": "Stay hydrated during long sessions — water, not energy drinks", "category": "health", "icon": "💧"},
        {"text": "You're a model gamer. Share your habits with your friends!", "category": "mental", "icon": "🧠"},
    ],
}

def get_coaching_tips(rage_pred: bool, addiction_category: str) -> List[Dict]:
    key = (rage_pred, addiction_category)
    return COACHING_TIPS.get(key, COACHING_TIPS[(False, 'Low')])

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(
    title="Adaptive Gamer Coaching System API (Deep Learning Enabled)",
    description="Behavioral Deep Neural Network (MLP) predictions for rage-quit risk and addiction level",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# REQUEST / RESPONSE MODELS
# ─────────────────────────────────────────────
class PlayerInput(BaseModel):
    stress_level: float = Field(..., ge=1, le=10)
    anxiety_score: float = Field(..., ge=0, le=10)
    daily_gaming_hours: float = Field(..., ge=0, le=24)
    toxic_exposure: float = Field(..., ge=0, le=1)
    night_gaming_ratio: float = Field(..., ge=0, le=1)
    weekly_sessions: int = Field(..., ge=1, le=50)
    sleep_hours: float = Field(..., ge=0, le=16)
    loneliness_score: float = Field(..., ge=0, le=10)
    social_interaction_score: float = Field(..., ge=0, le=10)
    microtransactions_spending: float = Field(..., ge=0)
    years_gaming: int = Field(..., ge=0, le=40)
    happiness_score: float = Field(..., ge=0, le=10)
    depression_score: float = Field(..., ge=0, le=10)
    aggression_score: float = Field(default=5.0, ge=0, le=10)

class CoachingTip(BaseModel):
    text: str
    category: str
    icon: str

class PredictionResponse(BaseModel):
    rage_probability: float
    rage_prediction: bool
    rage_risk_level: str
    addiction_category: str
    addiction_probabilities: Dict[str, float]
    coaching_tips: List[CoachingTip]
    input_summary: Dict[str, float]
    deep_learning_meta: Dict
    addiction_index: float
    report: Dict[str, Any]

# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": MODELS_LOADED, "architecture": "Deep Multi-Layer Perceptron"}

@app.get("/players/search")
def search_players(q: str = "", limit: int = 8):
    """Search the Valorant player database by Riot ID (name or name#tag)."""
    return {"results": players.search(q, min(limit, 20))}


@app.get("/players/lookup")
def lookup_player(riot_id: str):
    """Full profile for a Riot ID: rank, stats, agents, recent matches and play-time pattern."""
    if not riot_id.strip():
        raise HTTPException(status_code=400, detail="Enter a Riot ID like name#tag")
    return players.lookup(riot_id)


@app.post("/predict", response_model=PredictionResponse)
def predict(player: PlayerInput):
    if not MODELS_LOADED:
        raise HTTPException(status_code=503, detail="Deep Learning models not loaded")
    
    try:
        x = player.model_dump()

        def rage_batch(rows: List[Dict[str, float]]) -> np.ndarray:
            raw = np.array([[r[f] for f in RAGE_FEATURES] for r in rows])
            return rage_model.predict_proba(scaler_rage.transform(raw))[:, 1]

        def addiction_batch(rows: List[Dict[str, float]]) -> np.ndarray:
            # Expected severity on a 0-1 scale: Low=0, Medium=0.5, High=1
            raw = np.array([[r[f] for f in ADDICTION_FEATURES] for r in rows])
            probs = addiction_model.predict_proba(scaler_addiction.transform(raw))
            weights = np.array([{"Low": 0.0, "Medium": 0.5, "High": 1.0}[c] for c in label_encoder.classes_])
            return probs @ weights

        def rage_fn(values: Dict[str, float]) -> float:
            return float(rage_batch([values])[0])

        def addiction_probs_fn(values: Dict[str, float]) -> Dict[str, float]:
            raw = np.array([[values[f] for f in ADDICTION_FEATURES]])
            probs = addiction_model.predict_proba(scaler_addiction.transform(raw))[0]
            return {cls: float(p) for cls, p in zip(label_encoder.classes_, probs)}

        def addiction_index_fn(values: Dict[str, float]) -> float:
            return float(addiction_batch([values])[0])

        def addiction_class_fn(values: Dict[str, float]) -> str:
            p = addiction_probs_fn(values)
            return max(p, key=p.get)

        rage_prob = rage_fn(x)
        rage_pred = rage_prob >= 0.5

        if rage_prob < 0.40:
            rage_risk_level = "LOW"
        elif rage_prob < 0.70:
            rage_risk_level = "MEDIUM"
        else:
            rage_risk_level = "HIGH"

        add_probs = addiction_probs_fn(x)
        add_category = max(add_probs, key=add_probs.get)
        add_index = addiction_index_fn(x) * 100

        report = build_report(
            x, rage_fn, addiction_index_fn, addiction_class_fn, rage_batch, addiction_batch,
            rage_prob, rage_risk_level, add_category, add_index,
        )

        tips = get_coaching_tips(rage_pred, add_category)
        
        input_summary = {
            "stress_level": player.stress_level,
            "anxiety_score": player.anxiety_score,
            "loneliness_score": player.loneliness_score,
            "gaming_intensity": min(10, player.daily_gaming_hours / 1.2),
            "sleep_deprivation": max(0, 10 - player.sleep_hours),
            "social_score": player.social_interaction_score,
        }
        
        return PredictionResponse(
            rage_probability=round(rage_prob, 4),
            rage_prediction=rage_pred,
            rage_risk_level=rage_risk_level,
            addiction_category=add_category,
            addiction_probabilities=add_probs,
            coaching_tips=[CoachingTip(**tip) for tip in tips],
            input_summary={k: round(v, 2) for k, v in input_summary.items()},
            deep_learning_meta=DL_META,
            addiction_index=round(add_index, 1),
            report=report,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
