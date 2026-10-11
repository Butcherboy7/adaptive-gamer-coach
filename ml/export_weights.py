"""
Export the trained MLPs and scalers to plain JSON (ml/mlp_weights.json).

The API runs the networks with NumPy only (backend/mlp.py), so the deployed server
doesn't need scikit-learn or SciPy, which are too large for a Vercel function.
Run from the ml/ folder after training:  python export_weights.py
(train_deep_learning.py calls this automatically.)
"""

import json
import joblib


def export(out_path='mlp_weights.json'):
    def net(model):
        return {
            "coefs": [c.tolist() for c in model.coefs_],
            "intercepts": [b.tolist() for b in model.intercepts_],
            "hidden_activation": model.activation,
            "out_activation": model.out_activation_,
        }

    def scaler(s):
        return {"mean": s.mean_.tolist(), "scale": s.scale_.tolist()}

    le = joblib.load('addiction_label_encoder.pkl')
    weights = {
        "rage": {**net(joblib.load('rage_model.pkl')), "scaler": scaler(joblib.load('scaler_rage.pkl'))},
        "addiction": {
            **net(joblib.load('addiction_model.pkl')),
            "scaler": scaler(joblib.load('scaler_addiction.pkl')),
            "classes": le.classes_.tolist(),
        },
    }
    with open(out_path, 'w') as f:
        json.dump(weights, f)
    print(f"Saved {out_path}")


if __name__ == '__main__':
    export()
