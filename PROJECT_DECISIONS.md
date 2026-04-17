# 📋 PROJECT DECISIONS & TECHNICAL HANDOFF
## Adaptive Gamer Coaching System — Full Context for Collaborators

> **Read this document if you're continuing this project, reviewing the work, or need to understand every decision made and why.**

---

## 1. WHAT THIS PROJECT IS

A full-stack ML system that takes 13 behavioral self-reported inputs from a gamer and outputs:
- **Rage-Quit Risk** (0–100% probability, LOW/MEDIUM/HIGH)
- **Addiction Level** (Low / Medium / High)
- **Personalized coaching tips** based on the combined output

**Components:**
- `ml/` — Model training pipeline (Python scikit-learn)
- `backend/` — FastAPI REST API serving predictions
- `frontend/` — React + Vite + Tailwind dashboard (cyberpunk theme)

---

## 2. THE DATASET

**File:** `ml/gaming_mental_health_10M_40features.csv`
**Size:** 165 MB, 1,000,000 rows, 39 columns
**Why this dataset:** It covers both gaming behavior (hours, sessions, toxicity, night gaming) and mental health self-reports (stress, anxiety, depression, loneliness). This dual coverage is essential because rage-quit and addiction are psychophysical problems — you can't predict them from gaming behavior alone.

**Why we use 200,000 rows instead of all 1M:**
Training on 1M rows with Random Forest and Gradient Boosting would take 30–40 minutes with no meaningful accuracy gain over 200k. A stratified random sample of 200k retains the same class distributions.

**Key columns used:**

| Column | Type | Used For |
|--------|------|----------|
| `stress_level` | 1–10 | Rage model feature |
| `anxiety_score` | 0–10 | Rage model feature |
| `daily_gaming_hours` | float | Both models |
| `weekly_sessions` | int | Both models |
| `night_gaming_ratio` | 0–1 | Both models |
| `sleep_hours` | float | Both models |
| `toxic_exposure` | 0–1 | Rage model feature |
| `loneliness_score` | 0–10 | Both models |
| `social_interaction_score` | 0–10 | Addiction model feature |
| `microtransactions_spending` | float ($) | Addiction model feature |
| `years_gaming` | int | Addiction model feature |
| `happiness_score` | 0–10 | Addiction model feature |
| `depression_score` | 0–10 | Addiction model feature |
| `aggression_score` | 0–10 | **Label construction only — NOT a model input** |
| `addiction_level` | 0–10 | **Label construction only — NOT a model input** |

---

## 3. LABEL ENGINEERING — HOW WE DEFINED THE TARGETS

### 3a. Rage-Quit Label (Binary)
```python
rage_quit = 1 if (aggression_score > 6.0) AND (stress_level >= 7) else 0
# Positive rate: ~12.3% of training rows
```

## Technical Decision: prioritization of Localhost & Standard ML Libraries

### Context
While investigating cloud deployment optimization (ONNX), we decided to revert to the standard **Scikit-Learn/Joblib** ecosystem. 

### Rationale
1. **Developer Experience**: Using `.pkl` and standard `scikit-learn` is more intuitive for students and researchers. It allows for easier retraining and inspection of model objects (feature importances, tree visualization) without complex conversion steps.
2. **Localhost Optimization**: For this phase of the project, local performance and ease of setup on a standard machine are prioritized over serverless bundle constraints.
3. **Library Maturity**: Scikit-Learn provides out-of-the-box support for all the algorithms used, ensuring maximum stability in the prediction logic.

---

## Technical Decision: Pivot from Riot API to Behavioral ML
expression of emotional dysregulation under competitive stress. Psychological research consistently links it to the **intersection** of elevated frustration state (stress ≥ 7) and external behavioral signal (aggression > 6). Neither alone is sufficient — a calm aggressive player is just competitive; a stressed non-aggressive player stays in the game.

**Why AND, not OR:**
Using OR would label ~40–50% of players as rage-quitters (too many false positives). AND keeps it a meaningful ~12% rate.

**Critical decision — aggression_score excluded from model features:**
Initially, `aggression_score` was included as a model input AND was part of the label formula. This created a **tautological model** — the classifier was trivially learning the threshold we wrote rather than discovering correlation. We removed it from the feature list so the model had to genuinely predict rage from 8 independent signals. This lowered ROC-AUC from ~0.97 (fake) to 0.84 (genuine). The 0.84 is the real number.

### 3b. Addiction Label (Multi-class)
```python
addiction_category = pd.cut(
    addiction_level,    # dataset's pre-computed 0–10 score
    bins=[-1, 3.33, 6.66, 10],
    labels=['Low', 'Medium', 'High']
)
```

**Why this approach:**
`addiction_level` was pre-computed in the dataset from multiple survey factors (we didn't construct it). We simply binned it into three equal-width categories for multi-class classification. This model has **no tautology** — all features are genuinely independent from the label.

**Why equal-width bins (0–3.33, 3.33–6.66, 6.66–10):**
Simpler and more interpretable than quantile bins. Mild drawback: the dataset skews toward Low (~66%), Medium (~28%), High (~6%), which makes the High class harder to predict. We accept this — the model reached 83% precision on High with Gradient Boosting.

---

## 4. ALGORITHM DECISIONS

### 4a. Rage-Quit → Random Forest (Binary Classification)

**Why Random Forest:**
- Handles mixed-scale features (ratio 0–1 mixed with 0–10 scores) without normalization
- `class_weight='balanced'` corrects for the 88%/12% imbalance automatically
- Non-linear — captures interactions like "high stress AND long sessions AND low sleep"
- Fast to train at 200k rows with `n_jobs=-1` (parallel cores)

**Hyperparameters chosen:**
```python
RandomForestClassifier(
    n_estimators=100,    # 100 trees — diminishing returns beyond this
    max_depth=15,        # Prevents overfitting on 200k rows
    min_samples_leaf=5,  # Each leaf must have 5+ samples
    class_weight='balanced'  # Critical for 12% positive rate
)
```

**Why NOT logistic regression:** The rage-quit trigger is non-linear (it requires BOTH stress AND gaming pattern to be elevated together — AND condition). Logistic regression can't model this without explicit interaction features.

**Why NOT SVM:** Too slow on 200k rows.

### 4b. Addiction → Gradient Boosting (Multi-class)

**Why Gradient Boosting:**
- Addiction is a graded, ordered phenomenon (Low < Medium < High) — boosting builds trees that gradually refine class boundaries
- Naturally handles multi-class without one-vs-rest workaround
- Better than RF on imbalanced multi-class because boosting focuses more attention on hard-to-classify examples

**Hyperparameters chosen:**
```python
GradientBoostingClassifier(
    n_estimators=100,
    max_depth=5,         # Shallower than RF — GBM overfits more easily
    learning_rate=0.1,   # Standard safe value
    subsample=0.8        # Row subsampling — reduces variance
)
```

---

## 5. MODEL EVALUATION RESULTS (After Tautology Fix)

### Rage-Quit Model
```
ROC-AUC:       0.8395
5-Fold CV AUC: 0.8417 ± 0.0016  (very stable)
Recall (Rage): 100% — catches every rage case (high sensitivity, by design)
Precision (Rage): 31% — some false alarms (acceptable for coaching app)
```

**Interpretation of 100% recall:** With `class_weight='balanced'`, the model strongly errs toward flagging rage risk. For a coaching application, missing a rage-quit case is worse than a false alarm, so this is the correct tradeoff.

**Feature importances (what the model actually learned):**
```
stress_level:          92.1%  →  dominant predictor
sleep_hours:            1.3%
daily_gaming_hours:     1.3%
anxiety_score:          1.3%
loneliness_score:       1.3%
night_gaming_ratio:     1.0%
toxic_exposure:         1.0%
weekly_sessions:        0.8%
```

**Why stress_level dominates:** This is expected. The label was `stress >= 7 AND aggression > 6`. Since we removed aggression from features, the model correctly identified stress as the strongest remaining independent predictor. This is consistent with psychological research on competitive gaming behavior.

### Addiction Model
```
Overall Accuracy: 85%
Macro F1-Score:   0.80
High precision:   83% at 72% recall
Low precision:    88% at 93% recall
Medium precision: 75% at 69% recall
```

Medium is the hardest class (fuzzy boundary between Low and High). This is normal and acceptable.

---

## 6. COACHING LOGIC

The coaching system is **rule-based**, not ML. The ML outputs two signals, and we map the 2×3 combination to a tip list:

```
rage=True  + addiction=High   → 4 tips (most intense intervention)
rage=True  + addiction=Medium → 3 tips
rage=False + addiction=High   → 3 tips
rage=False + addiction=Medium → 2 tips
rage=False + addiction=Low    → 3 tips (positive reinforcement)
```

**Why rule-based and not another model:** Coaching recommendations are interpretable physician-grade advice. Black-box ML outputs for advice creation are not auditable. Rule-based ensures every recommendation is deliberate and explainable.

---

## 7. BACKEND ARCHITECTURE DECISIONS

**FastAPI (not Flask, not Django):**
- Async by default — required for Phase 2 Riot API calls
- Auto-generates OpenAPI/Swagger docs at `/docs`
- Pydantic model validation on all inputs (type checking, range enforcement)
- 3–5x faster than Flask for the same load

**Model loading at startup (not per-request):**
Models are loaded once when the server starts, held in memory. A request-time load would add 1–3 seconds of latency per prediction. With models in RAM, each prediction takes ~50ms.

**503 graceful fallback:**
If models fail to load, the server still starts but returns 503 on `/predict` with a clear error message. This prevents cryptic crashes.

---

## 8. FRONTEND DECISIONS

**React + Vite (not Next.js, not CRA):**
- Vite is 10× faster hot-reload than CRA
- No server-side rendering needed — pure client dashboard
- Smallest config footprint

**Tailwind v3 (not v4, not plain CSS):**
- v4 is in beta with breaking changes from `@import "tailwindcss"` syntax
- v3 is stable and well-documented
- Custom design tokens for the cyberpunk palette in `tailwind.config.js`

**Recharts (not Chart.js, not D3):**
- React-native component API — no imperative canvas manipulation
- SVG-based — can be themed with CSS-in-JS / inline styles
- AreaChart for addiction trend, RadarChart for behavioral profile

**Custom SVG gauge for rage probability:**
- Recharts doesn't have a semicircular gauge
- Built from scratch with SVG arc math + `requestAnimationFrame`
- Fills from 0° to 180° proportional to rage probability

---

## 9. DECISIONS WE RECONSIDERED

| Decision | Original | Changed To | Why |
|----------|----------|------------|-----|
| Rage features | Included `aggression_score` | Removed it | Tautological — it was in the label definition |
| Training rows | Full 1M | Sample 200k | Same accuracy, 5× faster training |
| Addiction label | Numeric regression | Binned multi-class | More actionable for coaching (Low/Med/High) |
| Risk level thresholds | 40%/70% hardcoded | Kept but documented | Simple and works; quantile thresholds are Phase 2 |
| Radar chart key | `sleep_quality` | `sleep_deprivation` | Original name was inverted and confusing |
| Gaming intensity scale | `/2.4` (24h → 10) | `/1.2` (12h → 10) | More realistic — 24h/day gaming is impossiblee |

---

## 10. PHASE 2: RIOT API Hurdles & Decision
**Status:** Scaffolding complete, logic tested, but **Live Integration Halted**.

**The Obstacle:** 
During development, we discovered that Riot Games has strict permission tiers for API keys.
1. **LoL/TFT:** Match history is accessible with a standard Personal Development Key.
2. **Valorant:** Match history is **blocked** (403 Forbidden) for Development Keys. It requires a formal "Production App" application and an approval process that takes weeks.

**The Decision:**
To ensure a stable, honest project for Review-3, we decided not to "spoof" or mock the data. Instead, we have kept the architecture in a separate branch (`riot-api`) but reverted the `main` branch to a high-fidelity manual-entry dashboard. This prevents "403 Forbidden" errors during a live demo and demonstrates professional awareness of API permission models.

---

## 11. DEPLOYMENT & SIZE OPTIMIZATION (Vercel)

**Goal:** Zero-setup, one-click cloud deployment.

**Decision 1: Removing Pandas (~100MB saved)**
Vercel has a 500MB limit for serverless functions. With `scikit-learn`, `scipy`, `numpy`, and `pandas`, the bundle reached 502MB. 
- *The Fix:* We removed the `pandas` dependency entirely from the inference engine. We now use pure `numpy` to feed the model. This brought the bundle down to ~270MB.

**Decision 2: The .vercelignore Strategy**
Vercel bundles the entire root directory into the Lambda function. With `frontend/node_modules` (~200MB+), the build failed.
- *The Fix:* Added `.vercelignore` to exclude local `node_modules` and raw source code from the Python bundle, while still allowing them to be used during the Static Build phase. Final Lambda size: ~15MB.

**Decision 3: Serverless Bridge (`api/index.py`)**
Vercel expects Python functions in an `api/` folder. Since our FastAPI app was in `backend/`, we created a root bridge to allow Vercel to treat the entire repo as a monolithic deployment.

---

## 12. PROJECT STATUS: FINALIZED MVP (main)

- **GitHub:** https://github.com/Butcherboy7/adaptive-gamer-coach
- **Live URL:** (If deployed on Vercel)
- **Data Integrity:** The 170MB CSV is removed from the repo to keep it lightweight. The pre-trained models are included, making the project portable and immediately runnable.

## 13. HOW TO RUN

**Local Run:**
1. Clone → `npm run install` (in root)
2. Terminal 1: `cd backend && python -m uvicorn main:app --port 8000`
3. Terminal 2: `cd frontend && npm run dev`

**Cloud Deploy:**
1. Push to GitHub.
2. Import to Vercel.
3. Use Build Command: `npm run build` and Output Directory: `frontend/dist`.

Models are pre-included in the repo (rage_model.pkl, addiction_model.pkl). No training step required for fresh clone.
