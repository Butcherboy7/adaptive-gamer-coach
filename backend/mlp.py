"""
NumPy-only inference for the trained MLPs (exported by ml/export_weights.py).

Mirrors scikit-learn's MLPClassifier.predict_proba and StandardScaler.transform exactly,
so the API can run without scikit-learn (keeps the Vercel function small).
"""

import json
from pathlib import Path
from typing import List

import numpy as np


def _relu(z):
    return np.maximum(z, 0)


class Scaler:
    def __init__(self, mean, scale):
        self.mean = np.asarray(mean)
        self.scale = np.asarray(scale)

    def transform(self, x):
        return (np.asarray(x, dtype=float) - self.mean) / self.scale


class MLP:
    def __init__(self, coefs, intercepts, hidden_activation, out_activation):
        if hidden_activation != "relu":
            raise ValueError(f"Unsupported hidden activation: {hidden_activation}")
        self.coefs = [np.asarray(c) for c in coefs]
        self.intercepts = [np.asarray(b) for b in intercepts]
        self.out_activation = out_activation

    def predict_proba(self, x):
        a = np.asarray(x, dtype=float)
        for w, b in zip(self.coefs[:-1], self.intercepts[:-1]):
            a = _relu(a @ w + b)
        z = a @ self.coefs[-1] + self.intercepts[-1]
        if self.out_activation == "logistic":
            p = 1 / (1 + np.exp(-z))
            return np.hstack([1 - p, p])
        z = z - z.max(axis=1, keepdims=True)
        e = np.exp(z)
        return e / e.sum(axis=1, keepdims=True)


class Labels:
    def __init__(self, classes: List[str]):
        self.classes_ = np.asarray(classes)


def load(path: Path):
    """Returns (rage_model, addiction_model, scaler_rage, scaler_addiction, label_encoder)."""
    w = json.loads(Path(path).read_text())
    r, a = w["rage"], w["addiction"]
    net = lambda d: MLP(d["coefs"], d["intercepts"], d["hidden_activation"], d["out_activation"])
    return (net(r), net(a), Scaler(**r["scaler"]), Scaler(**a["scaler"]), Labels(a["classes"]))
