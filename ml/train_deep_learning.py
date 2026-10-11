"""
Adaptive Gamer Coaching System — Deep Neural Network Training Pipeline
Trains Scikit-Learn Multi-Layer Perceptron (MLP) models for Rage-Quit (tilt) and
Addiction prediction, with loss-curve tracking and held-out evaluation metrics.
Pure NumPy & Scikit-Learn implementation (no pandas needed).

Run from the ml/ folder:  python train_deep_learning.py

Training data is SYNTHETIC. Labels come from documented risk functions (below) built
from the behavioural factors the dashboard asks about, plus random noise, so that every
input the user can change has a real, explainable effect on the prediction.
"""

import numpy as np
import joblib
import json
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

print("=" * 70)
print("ADAPTIVE GAMER COACH — DEEP NEURAL NETWORK (MLP) PIPELINE")
print("=" * 70)

RAGE_FEATURES = [
    'stress_level', 'anxiety_score', 'aggression_score', 'daily_gaming_hours', 'toxic_exposure',
    'night_gaming_ratio', 'weekly_sessions', 'sleep_hours', 'loneliness_score'
]

ADDICTION_FEATURES = [
    'daily_gaming_hours', 'weekly_sessions', 'night_gaming_ratio', 'sleep_hours',
    'loneliness_score', 'social_interaction_score', 'microtransactions_spending',
    'years_gaming', 'happiness_score', 'depression_score'
]

rng = np.random.default_rng(42)
N_REALISTIC = 16000   # population-shaped samples
N_UNIFORM = 6000      # uniform samples so extremes are covered too
N = N_REALISTIC + N_UNIFORM

print(f"\n[1/4] Generating training data ({N} samples)...")


def mix(realistic, lo, hi, integer=False):
    uniform = rng.uniform(lo, hi, N_UNIFORM)
    out = np.clip(np.concatenate([realistic, uniform]), lo, hi)
    return np.round(out) if integer else out


X = {
    'stress_level':               mix(rng.normal(5, 2, N_REALISTIC), 1, 10),
    'anxiety_score':              mix(rng.normal(4.5, 2.2, N_REALISTIC), 0, 10),
    'aggression_score':           mix(rng.normal(4.5, 2.2, N_REALISTIC), 0, 10),
    'daily_gaming_hours':         mix(rng.gamma(2.0, 1.8, N_REALISTIC), 0, 16),
    'toxic_exposure':             mix(rng.beta(2, 4, N_REALISTIC), 0, 1),
    'night_gaming_ratio':         mix(rng.beta(2, 3.5, N_REALISTIC), 0, 1),
    'weekly_sessions':            mix(rng.normal(15, 8, N_REALISTIC), 1, 50, integer=True),
    'sleep_hours':                mix(rng.normal(7, 1.3, N_REALISTIC), 3, 12),
    'loneliness_score':           mix(rng.normal(4.5, 2.3, N_REALISTIC), 0, 10),
    'social_interaction_score':   mix(rng.normal(5.5, 2.2, N_REALISTIC), 0, 10),
    'microtransactions_spending': mix(rng.gamma(1.2, 30, N_REALISTIC), 0, 500),
    'years_gaming':               mix(rng.normal(7, 4, N_REALISTIC), 0, 30, integer=True),
    'happiness_score':            mix(rng.normal(6, 2, N_REALISTIC), 0, 10),
    'depression_score':           mix(rng.normal(3.5, 2.2, N_REALISTIC), 0, 10),
}


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


# ── Rage-quit (tilt) label ──
# Emotional load + provocation + fatigue. Sleep debt and toxic lobbies matter as much
# as stress itself; loneliness and long sessions add smaller effects.
rage_logit = (
    0.45 * (X['stress_level'] - 5)
    + 0.25 * (X['anxiety_score'] - 5)
    + 0.35 * (X['aggression_score'] - 5)
    + 2.2 * (X['toxic_exposure'] - 0.3)
    + 1.2 * (X['night_gaming_ratio'] - 0.3)
    + 0.12 * (X['daily_gaming_hours'] - 4)
    + 0.45 * (7 - X['sleep_hours'])
    + 0.15 * (X['loneliness_score'] - 5)
    + 0.02 * (X['weekly_sessions'] - 15)
    - 1.0
)
y_rage = (rng.uniform(0, 1, N) < sigmoid(rage_logit)).astype(int)

# ── Addiction label (3 classes) ──
# Loosely follows gaming-disorder warning signs: time & frequency, late-night play,
# sleep loss, social withdrawal, spending, and gaming used to escape low mood.
addiction_score = (
    0.45 * X['daily_gaming_hours']
    + 0.06 * X['weekly_sessions']
    + 2.0 * X['night_gaming_ratio']
    + 0.35 * np.maximum(0, 7 - X['sleep_hours'])
    + 0.15 * X['loneliness_score']
    - 0.15 * X['social_interaction_score']
    + 0.006 * X['microtransactions_spending']
    + 0.03 * X['years_gaming']
    - 0.15 * X['happiness_score']
    + 0.15 * X['depression_score']
    + rng.normal(0, 0.5, N)
)
y_addiction_str = np.where(addiction_score < 4.5, 'Low', np.where(addiction_score < 7.5, 'Medium', 'High'))

print(f"  Rage-quit positive rate: {y_rage.mean():.1%}")
for cls in ['Low', 'Medium', 'High']:
    print(f"  Addiction {cls:<6}: {(y_addiction_str == cls).mean():.1%}")

X_rage = np.column_stack([X[f] for f in RAGE_FEATURES])
X_addiction = np.column_stack([X[f] for f in ADDICTION_FEATURES])

le = LabelEncoder()
y_addiction = le.fit_transform(y_addiction_str)

Xr_train, Xr_test, yr_train, yr_test = train_test_split(X_rage, y_rage, test_size=0.2, random_state=42, stratify=y_rage)
Xa_train, Xa_test, ya_train, ya_test = train_test_split(X_addiction, y_addiction, test_size=0.2, random_state=42, stratify=y_addiction)

scaler_rage = StandardScaler().fit(Xr_train)
scaler_addiction = StandardScaler().fit(Xa_train)


def make_mlp():
    return MLPClassifier(
        hidden_layer_sizes=(128, 64),
        activation='relu',
        solver='adam',
        alpha=1e-3,
        max_iter=200,
        random_state=42,
        early_stopping=True,
        n_iter_no_change=10,
    )


# ─────────────────────────────────────────────
# 2. RAGE-QUIT MLP  [9 -> 128 -> 64 -> 1]
# ─────────────────────────────────────────────
print("\n[2/4] Training MLP for Rage-Quit Risk...")
mlp_rage = make_mlp().fit(scaler_rage.transform(Xr_train), yr_train)
rage_prob_test = mlp_rage.predict_proba(scaler_rage.transform(Xr_test))[:, 1]
# Labels are sampled from a probability, so even a perfect model can't reach 100% accuracy.
rage_bayes_acc = np.maximum(sigmoid(rage_logit), 1 - sigmoid(rage_logit)).mean()
rage_metrics = {
    "accuracy": round(accuracy_score(yr_test, rage_prob_test >= 0.5), 4),
    "roc_auc": round(roc_auc_score(yr_test, rage_prob_test), 4),
    "best_possible_accuracy": round(float(rage_bayes_acc), 4),
}
print(f"  Converged in {mlp_rage.n_iter_} epochs | {rage_metrics}")

# ─────────────────────────────────────────────
# 3. ADDICTION MLP  [10 -> 128 -> 64 -> 3]
# ─────────────────────────────────────────────
print("\n[3/4] Training MLP for Addiction Category...")
mlp_addiction = make_mlp().fit(scaler_addiction.transform(Xa_train), ya_train)
add_pred_test = mlp_addiction.predict(scaler_addiction.transform(Xa_test))
addiction_metrics = {
    "accuracy": round(accuracy_score(ya_test, add_pred_test), 4),
    "macro_f1": round(f1_score(ya_test, add_pred_test, average='macro'), 4),
}
print(f"  Converged in {mlp_addiction.n_iter_} epochs | {addiction_metrics}")

# Save models & metadata
joblib.dump(mlp_rage, 'rage_model.pkl')
joblib.dump(mlp_addiction, 'addiction_model.pkl')
joblib.dump(le, 'addiction_label_encoder.pkl')
joblib.dump(scaler_rage, 'scaler_rage.pkl')
joblib.dump(scaler_addiction, 'scaler_addiction.pkl')

dl_metadata = {
    "architecture": "Multi-Layer Perceptron (Dense-128 ReLU -> Dense-64 ReLU -> Softmax), L2 alpha=1e-3",
    "optimizer": "Adam (lr=0.001), early stopping",
    "activation": "ReLU",
    "training_samples": int(len(Xr_train)),
    "test_samples": int(len(Xr_test)),
    "data_source": "Synthetic, population-shaped behavioural data with documented risk-function labels",
    "rage_metrics": rage_metrics,
    "addiction_metrics": addiction_metrics,
    "rage_loss_history": [round(x, 4) for x in mlp_rage.loss_curve_],
    "addiction_loss_history": [round(x, 4) for x in mlp_addiction.loss_curve_],
    "rage_epochs": mlp_rage.n_iter_,
    "addiction_epochs": mlp_addiction.n_iter_,
}

with open('deep_learning_meta.json', 'w') as f:
    json.dump(dl_metadata, f, indent=2)
with open('rage_features.json', 'w') as f:
    json.dump(RAGE_FEATURES, f)
with open('addiction_features.json', 'w') as f:
    json.dump(ADDICTION_FEATURES, f)

from export_weights import export
export()  # NumPy-ready weights the API serves from (no scikit-learn needed at runtime)

print("\n[4/4] Saved: rage_model.pkl, addiction_model.pkl, scalers, label encoder, mlp_weights.json, deep_learning_meta.json")
print("=" * 70)
