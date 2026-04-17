"""
Adaptive Gamer Coaching System — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
Must be run from backend/ directory OR with correct relative paths to ml/
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import onnxruntime as rt
import json
import numpy as np
import os
from pathlib import Path
from typing import Dict, List, Optional

# ─────────────────────────────────────────────
# PATH SETUP — handles running from any directory
# ─────────────────────────────────────────────
BACKEND_DIR = Path(__file__).parent
ML_DIR = BACKEND_DIR.parent / "ml"

# ─────────────────────────────────────────────
# LOAD MODELS ON STARTUP
# ─────────────────────────────────────────────
print("Loading ONNX models...")

try:
    # Use CPU provider for serverless compatibility
    sess_rage = rt.InferenceSession(str(ML_DIR / "rage_model.onnx"), providers=['CPUExecutionProvider'])
    sess_add = rt.InferenceSession(str(ML_DIR / "addiction_model.onnx"), providers=['CPUExecutionProvider'])
    
    # Label encoder was saved as joblib, but we can just use a hardcoded list 
    # since we know the categories from train_models.py (Low: 1, Medium: 2, High: 0 usually? No, let's check le.classes_)
    # From train_models log: Label encoding: {'High': 0, 'Low': 1, 'Medium': 2}
    # Wait, the log showed: 'High': 0, 'Low': 1, 'Medium': 2
    # So we can use a simple list: [ "High", "Low", "Medium" ]
    ADDICTION_CLASSES = ["High", "Low", "Medium"]
    
    with open(ML_DIR / "rage_features.json") as f:
        RAGE_FEATURES = json.load(f)
    with open(ML_DIR / "addiction_features.json") as f:
        ADDICTION_FEATURES = json.load(f)
    
    print("SUCCESS: All ONNX models loaded successfully")
    MODELS_LOADED = True
except Exception as e:
    print(f"ERROR: Model loading failed: {e}")
    MODELS_LOADED = False
    sess_rage = sess_add = None
    RAGE_FEATURES = ADDICTION_FEATURES = []
    ADDICTION_CLASSES = []

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
    title="Adaptive Gamer Coaching System API",
    description="Behavioral ML predictions for rage-quit risk and addiction level",
    version="1.0.0"
)

# CORS — allow React dev server and production origins
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
    # Rage features (8 independent behavioral signals — no circular dependency)
    stress_level: float = Field(..., ge=1, le=10, description="Perceived stress level 1-10")
    anxiety_score: float = Field(..., ge=0, le=10, description="Anxiety score 0-10")
    daily_gaming_hours: float = Field(..., ge=0, le=24, description="Average daily gaming hours")
    toxic_exposure: float = Field(..., ge=0, le=1, description="Toxic player exposure ratio 0-1")
    night_gaming_ratio: float = Field(..., ge=0, le=1, description="Proportion of gaming done at night 0-1")
    weekly_sessions: int = Field(..., ge=1, le=50, description="Number of gaming sessions per week")
    sleep_hours: float = Field(..., ge=0, le=16, description="Average sleep hours per night")
    loneliness_score: float = Field(..., ge=0, le=10, description="Loneliness score 0-10")
    # Addiction-only features
    social_interaction_score: float = Field(..., ge=0, le=10, description="Real-world social interaction 0-10")
    microtransactions_spending: float = Field(..., ge=0, description="Monthly microtransaction spend ($)")
    years_gaming: int = Field(..., ge=0, le=40, description="Years of gaming experience")
    happiness_score: float = Field(..., ge=0, le=10, description="General happiness score 0-10")
    depression_score: float = Field(..., ge=0, le=10, description="Depression score 0-10")
    # Informational only — used in UI but NOT a model feature (label-adjacent)
    aggression_score: float = Field(default=5.0, ge=0, le=10, description="In-game aggression 0-10 (UI display only)")

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

# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "models_loaded": MODELS_LOADED,
        "rage_features": RAGE_FEATURES,
        "addiction_features": ADDICTION_FEATURES
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(player: PlayerInput):
    if not MODELS_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Run ml/train_models.py first."
        )
    
    try:
        # Build rage feature vector (2D numpy array, float32 for ONNX)
        rage_input = np.array([[
            float(getattr(player, feat)) for feat in RAGE_FEATURES
        ]], dtype=np.float32)
        
        # Build addiction feature vector
        addiction_input = np.array([[
            float(getattr(player, feat)) for feat in ADDICTION_FEATURES
        ]], dtype=np.float32)
        
        # Rage prediction
        input_name = sess_rage.get_inputs()[0].name
        # Outputs: [label, probabilities_dict]
        res_rage = sess_rage.run(None, {input_name: rage_input})
        
        # res_rage[1] is a list of dicts: [{0: p0, 1: p1}]
        rage_prob = float(res_rage[1][0][1])
        rage_pred = bool(res_rage[0][0])
        
        # Risk level text
        if rage_prob < 0.40:
            rage_risk_level = "LOW"
        elif rage_prob < 0.70:
            rage_risk_level = "MEDIUM"
        else:
            rage_risk_level = "HIGH"
        
        # Addiction prediction
        input_name_add = sess_add.get_inputs()[0].name
        res_add = sess_add.run(None, {input_name_add: addiction_input})
        
        # res_add[0] is [label_index], res_add[1] is [{0: p0, 1: p1, 2: p2}]
        add_idx = int(res_add[0][0])
        add_probs_raw = res_add[1][0]
        
        add_category = ADDICTION_CLASSES[add_idx]
        add_probs = {
            ADDICTION_CLASSES[i]: float(add_probs_raw[i])
            for i in range(len(ADDICTION_CLASSES))
        }
        
        # Coaching tips
        tips = get_coaching_tips(rage_pred, add_category)
        
        # Input summary for radar chart — normalized, named accurately
        input_summary = {
            "stress_level": player.stress_level,
            "anxiety_score": player.anxiety_score,
            "loneliness_score": player.loneliness_score,
            "gaming_intensity": min(10, player.daily_gaming_hours / 1.2),  # 12h/day = max (10)
            "sleep_deprivation": max(0, 10 - player.sleep_hours),          # 0h sleep = 10, 10h = 0
            "social_score": player.social_interaction_score,
        }
        
        print(f"Prediction result: Rage={rage_pred} ({rage_prob:.2f}), Addiction={add_category}")

        return PredictionResponse(
            rage_probability=round(rage_prob, 4),
            rage_prediction=rage_pred,
            rage_risk_level=rage_risk_level,
            addiction_category=add_category,
            addiction_probabilities=add_probs,
            coaching_tips=[CoachingTip(**tip) for tip in tips],
            input_summary={k: round(v, 2) for k, v in input_summary.items()}
        )
    
    except Exception as e:
        import traceback
        print(f"PREDICTION ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# ─────────────────────────────────────────────
# PHASE 2 STUB — Riot API (not implemented yet)
# ─────────────────────────────────────────────
@app.post("/fetch-player")
def fetch_player_stub(riot_id: str, tag: str):
    """
    PHASE 2 STUB: Will fetch Riot API data and return computed features.
    Currently returns placeholder data for UI testing.
    """
    return {
        "status": "stub",
        "message": "Phase 2 Riot API integration not yet implemented",
        "riot_id": riot_id,
        "tag": tag,
        "computed_features": {
            "daily_gaming_hours": None,
            "weekly_sessions": None,
            "night_gaming_ratio": None,
            "note": "These will be auto-filled from match history in Phase 2"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
