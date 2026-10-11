# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: a university review panel (Mallareddy University, Department of CSE; lead developer Abdullah) watching a live demo of a student SRP/RTRP project. They need to see, within seconds, that the system works, that the ML predictions are real, and that the output is genuinely useful to a gamer.

Implied end user: a Valorant player looking up their own Riot ID to understand their tilt (rage-quit) risk and gaming-addiction level, and what to do about it.

## Product Purpose
Adaptive Gamer Coach predicts rage-quit (tilt) risk and gaming-addiction level from session behaviour plus self-reported wellbeing, explains which factors drive the result, and turns it into a concrete, personalised recovery plan. Success: a reviewer can search a player, run the analysis, and read a clear, accurate, actionable report without the presenter explaining it.

## Positioning
Not a stat tracker. It joins match-history behaviour (hours, sessions, late-night play) with wellbeing signals that game APIs never expose (sleep, stress, loneliness, mood), and every recommendation is tied to the specific factors the model says are driving that player's risk.

## Operating Context
Live classroom/project-review demo on a laptop or projector. Two local processes: FastAPI backend on :8000 (MLP models via scikit-learn) and a Vite + React frontend on :5173. Optional Vercel deployment (`/api` serverless). Riot ID search uses a local synthetic database of Valorant player profiles; Riot API integration is scaffolded (`backend/riot_stub.py`) but inactive.

## Capabilities and Constraints
- Two MLP classifiers: tilt/rage-quit probability (binary) and addiction category (Low/Medium/High), trained on synthetic population-shaped data with documented label functions (`ml/train_deep_learning.py`).
- Per-factor attribution computed by re-scoring each input at a healthy baseline.
- Riot ID search over a synthetic player database; manual self-assessment mode.
- Not a clinical tool. Severe mood signals must route to real help resources, never be gamified.

## Brand Commitments
Name: Adaptive Gamer Coach. Voice: coach-like, direct, warm. Honest numbers, concrete steps, no shaming. The user explicitly allowed a total visual revamp; the previous neon/cyan "cyberpunk HUD" look is rejected ("not the vibecoded blue hue").

## Evidence on Hand
- Model metrics and loss curves: `ml/deep_learning_meta.json`.
- Player profiles come from a synthetic dataset and must not be presented as real people; no real pro players' names attached to mental-health scores.

## Product Principles
1. Every number shown comes from the model or the inputs; no decorative fake charts.
2. Explain before advising: show what drives the risk, then what to do about it.
3. Advice is specific to the player's own numbers, with targets and timeframes.
4. Calm, credible, and impressive to an academic reviewer.

## Accessibility & Inclusion
Readable on a projector: body text at comfortable sizes, strong contrast, color never the only signal for risk level.
