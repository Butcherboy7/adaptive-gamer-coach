"""
Coaching engine — turns model outputs into an explained, personalised recovery plan.

Everything numeric here is derived from the player's inputs or from re-running the
trained models (see `attribute`), never hardcoded percentages.
"""

from typing import Callable, Dict, List

import numpy as np


def shown(v: float) -> int:
    """Round half-up, like the UI's Math.round, so the summary quotes the same numbers the scores show."""
    return int(np.floor(v + 0.5))


# ─────────────────────────────────────────────
# FEATURE METADATA
# healthy: the range we coach towards. baseline: the healthy value used for attribution.
# worse: which direction is harmful ("high" or "low").
# ─────────────────────────────────────────────
FEATURES: Dict[str, Dict] = {
    "daily_gaming_hours":         {"label": "Daily play",          "unit": "h",   "min": 0, "max": 16,  "healthy": (0, 3),    "baseline": 2.0,  "worse": "high", "group": "habit"},
    "weekly_sessions":            {"label": "Sessions per week",   "unit": "",    "min": 0, "max": 50,  "healthy": (0, 14),   "baseline": 10,   "worse": "high", "group": "habit"},
    "night_gaming_ratio":         {"label": "Play after 10 PM",    "unit": "%",   "min": 0, "max": 1,   "healthy": (0, 0.2),  "baseline": 0.1,  "worse": "high", "group": "habit"},
    "sleep_hours":                {"label": "Sleep per night",     "unit": "h",   "min": 3, "max": 12,  "healthy": (7, 9),    "baseline": 8.0,  "worse": "low",  "group": "habit"},
    "toxic_exposure":             {"label": "Toxic lobbies",       "unit": "%",   "min": 0, "max": 1,   "healthy": (0, 0.25), "baseline": 0.1,  "worse": "high", "group": "habit"},
    "microtransactions_spending": {"label": "Monthly spend",       "unit": "$",   "min": 0, "max": 500, "healthy": (0, 30),   "baseline": 10,   "worse": "high", "group": "habit"},
    "stress_level":               {"label": "Stress",              "unit": "/10", "min": 1, "max": 10,  "healthy": (1, 4),    "baseline": 3.0,  "worse": "high", "group": "mind"},
    "anxiety_score":              {"label": "Anxiety",             "unit": "/10", "min": 0, "max": 10,  "healthy": (0, 4),    "baseline": 2.0,  "worse": "high", "group": "mind"},
    "aggression_score":           {"label": "Anger after losses",  "unit": "/10", "min": 0, "max": 10,  "healthy": (0, 4),    "baseline": 3.0,  "worse": "high", "group": "mind"},
    "depression_score":           {"label": "Low mood",            "unit": "/10", "min": 0, "max": 10,  "healthy": (0, 3),    "baseline": 1.0,  "worse": "high", "group": "mind"},
    "happiness_score":            {"label": "Happiness",           "unit": "/10", "min": 0, "max": 10,  "healthy": (6, 10),   "baseline": 7.0,  "worse": "low",  "group": "mind"},
    "loneliness_score":           {"label": "Loneliness",          "unit": "/10", "min": 0, "max": 10,  "healthy": (0, 4),    "baseline": 2.0,  "worse": "high", "group": "social"},
    "social_interaction_score":   {"label": "Offline social life", "unit": "/10", "min": 0, "max": 10,  "healthy": (6, 10),   "baseline": 7.0,  "worse": "low",  "group": "social"},
}


def fmt(feature: str, value: float) -> str:
    unit = FEATURES[feature]["unit"]
    if unit == "%":
        return f"{round(value * 100)}%"
    if unit == "$":
        return f"${round(value)}"
    if unit == "h":
        return f"{value:g}h"
    if unit == "/10":
        return f"{value:g}/10"
    return f"{value:g}"


def fmt_range(feature: str) -> str:
    lo, hi = FEATURES[feature]["healthy"]
    meta = FEATURES[feature]
    if meta["worse"] == "high":
        return f"≤ {fmt(feature, hi)}"
    return f"≥ {fmt(feature, lo)}"


def status_of(feature: str, value: float) -> str:
    meta = FEATURES[feature]
    lo, hi = meta["healthy"]
    span = meta["max"] - meta["min"]
    if lo <= value <= hi:
        return "healthy"
    gap = (value - hi) if value > hi else (lo - value)
    return "watch" if gap <= 0.15 * span else "risk"


# ─────────────────────────────────────────────
# PER-FACTOR COACHING COPY
# Each returns (why, [steps]) using the player's own numbers.
# ─────────────────────────────────────────────
def _hours(v, x):
    week = round(v * 7)
    return (
        f"You're averaging {v:g} hours a day, about {week} hours a week. Past roughly 3 hours a day, "
        "gaming starts crowding out sleep, study and people, and long sessions wear down focus and patience. "
        "Tired players tilt faster and find it harder to stop.",
        [
            f"Cut to {max(2.5, round(v * 0.8 * 2) / 2):g}h a day this week. Set the limit before you launch, not mid-session.",
            "Use a hard stop: a phone alarm on the other side of the room, or Windows Family Safety / console screen-time limits on your own account.",
            "Play in blocks of 2–3 ranked games, then take 10 minutes away from the screen: water, stretch, walk.",
            "Plan one gaming-free day a week and fill it in advance (sport, friends, a class) so the gap isn't just boredom.",
        ],
    )


def _sessions(v, x):
    return (
        f"{v:g} separate sessions a week means gaming is your default whenever there's a free moment. "
        "Frequent check-ins keep the urge to play switched on all day.",
        [
            f"Bundle play into fewer, planned sessions: aim for {min(int(v), 14)} or fewer a week, at set times.",
            "Log out of the Riot client and turn off auto-launch at startup, so starting a game is a decision rather than a reflex.",
            "Move the game shortcut off your desktop and taskbar.",
        ],
    )


def _night(v, x):
    return (
        f"About {round(v * 100)}% of your play happens after 10 PM. Late-night lobbies are tired, more toxic, "
        "and every game pushes your bedtime back, so you start tomorrow already on tilt.",
        [
            "Set a 'last queue' time of 10:30 PM: no new match after it, whatever the result of the last one.",
            "Switch to unrated or Deathmatch after 10 PM if you play at all. Never chase rank late at night.",
            "Charge your phone and controller outside the bedroom.",
        ],
    )


def _sleep(v, x):
    debt = max(0, 7.5 - v)
    return (
        f"You're sleeping {v:g} hours, about {debt:g}h less than your body needs each night. "
        "Sleep debt is one of the strongest drivers of irritability, slower reactions and poor impulse control, "
        "both in-game and out.",
        [
            "Pick a fixed wake-up time and keep it on weekends too. A consistent wake time fixes bedtime on its own.",
            "Screens off 30–45 minutes before bed. Use that time for something low-stakes like a shower, reading or music.",
            f"Move bedtime 20 minutes earlier each week until you're getting 7.5h or more (currently {v:g}h).",
            "No caffeine or energy drinks after 4 PM.",
        ],
    )


def _toxic(v, x):
    return (
        f"Roughly {round(v * 100)}% of your matches have toxic teammates or opponents. Taking abuse every game "
        "keeps you defensive and angry, and it's the most direct trigger for rage-quits.",
        [
            "Mute all text and voice chat from agent select (/mute or the comms settings). Use pings only.",
            "Queue with a duo or a 5-stack of friends. Premade teams see far less in-game abuse.",
            "Report and move on. Arguing back never wins the round.",
        ],
    )


def _spend(v, x):
    return (
        f"You're spending about ${round(v)} a month on skins and battle passes. Heavy in-game spending often "
        "goes hand in hand with compulsive play, because the shop and the grind are designed to keep you coming back.",
        [
            f"Set a fixed monthly budget (for example ${min(30, round(v))}) and pay with a prepaid card rather than a saved card.",
            "Wait 48 hours before any purchase. If you still want it after two days, buy it.",
            "Turn off store notifications and skip the night-market ritual.",
        ],
    )


def _stress(v, x):
    return (
        f"Your stress is at {v:g}/10. When you start a match already stressed, a lost round feels personal, "
        "and that's when tilt and the 'one more game to win it back' loop take over.",
        [
            "Before each session, do a 60-second check-in: if you're above 6/10, play unrated or don't queue at all.",
            "Between rounds, try box breathing: in for 4, hold for 4, out for 4, hold for 4. It lowers your heart rate fast.",
            "Deal with what's causing the stress first (deadlines, conflicts). Gaming to escape it usually makes it bigger.",
        ],
    )


def _anxiety(v, x):
    return (
        f"Anxiety at {v:g}/10 makes ranked feel like a test you can't fail. Rank anxiety leads to queue dodging, "
        "playing to 'not lose', and sessions that run late because you couldn't end on a loss.",
        [
            "Judge each session by one process goal (for example 'crosshair placement') rather than RR.",
            "Hide your rank and RR during play if it helps you focus on the round.",
            "If anxiety follows you outside the game, talk to a counsellor. It's common and very treatable.",
        ],
    )


def _aggression(v, x):
    return (
        f"Anger after losses is at {v:g}/10. Strong anger spikes are the clearest sign of tilt, and they "
        "predict rage-quits, flaming teammates and smashed peripherals.",
        [
            "Two-loss rule: after 2 losses in a row, stop ranked for at least 30 minutes.",
            "Name it out loud ('I'm tilted') and stand up from the desk. Labelling the feeling cuts its intensity.",
            "Review one death per loss in the replay instead of blaming teammates. It turns anger into a fix.",
        ],
    )


def _depression(v, x):
    return (
        f"Low mood is at {v:g}/10. When mood is low, gaming often becomes the main way to feel okay, "
        "which makes it harder to cut down and easy to lose whole days to.",
        [
            "Tell one person you trust how you've been feeling this week.",
            "Get daylight and movement every day, even a 15-minute walk. It's one of the most reliable mood lifts.",
            "If low mood lasts more than two weeks, or you have thoughts of harming yourself, please reach out to a professional (see support below).",
        ],
    )


def _happiness(v, x):
    return (
        f"Life satisfaction is at {v:g}/10. When the rest of life feels flat, the game becomes where the "
        "wins happen, and it's harder to step away from.",
        [
            "Write down three things outside gaming you used to enjoy, and schedule one this week.",
            "Set a small offline goal with visible progress (gym, a skill, a course). It gives you a sense of progression outside the game.",
        ],
    )


def _loneliness(v, x):
    return (
        f"Loneliness is at {v:g}/10. If gaming is your main social space, logging off can feel like losing your "
        "friends, and that keeps the sessions long.",
        [
            "Turn one online friendship into an offline or voice-call hangout that isn't a match.",
            "Join a campus club or local LAN/esports society, so you're with gamers in person.",
            "Play with friends rather than solo queue. Shared sessions are more social and easier to end.",
        ],
    )


def _social(v, x):
    return (
        f"Offline social life is at {v:g}/10. Fewer real-world connections means fewer reasons to log off, "
        "and less support when the game is going badly.",
        [
            "Schedule at least two in-person plans a week and treat them like ranked queue times.",
            "Eat at least one meal a day away from the desk, with other people where possible.",
        ],
    )


COPY: Dict[str, Callable] = {
    "daily_gaming_hours": _hours,
    "weekly_sessions": _sessions,
    "night_gaming_ratio": _night,
    "sleep_hours": _sleep,
    "toxic_exposure": _toxic,
    "microtransactions_spending": _spend,
    "stress_level": _stress,
    "anxiety_score": _anxiety,
    "aggression_score": _aggression,
    "depression_score": _depression,
    "happiness_score": _happiness,
    "loneliness_score": _loneliness,
    "social_interaction_score": _social,
}


# ─────────────────────────────────────────────
# ATTRIBUTION
# ─────────────────────────────────────────────
def attribute(x: Dict[str, float], rage_batch: Callable, addiction_batch: Callable, n_perm: int = 160) -> List[Dict]:
    """Sampled Shapley values against a healthy baseline profile.

    For random orderings of the factors we move the profile from the healthy baseline to the
    player's values one factor at a time and record how much each step changes each model's
    output. Averaged over orderings, the contributions sum exactly to
    score(player) - score(healthy baseline), so they stay meaningful even when a model is
    saturated near 0% or 100%. Values are in percentage points."""
    feats = list(FEATURES)
    baseline = dict(x)
    for f in feats:
        baseline[f] = FEATURES[f]["baseline"]

    rng = np.random.default_rng(7)
    points, orders = [], []
    for _ in range(n_perm):
        order = rng.permutation(len(feats))
        orders.append(order)
        cur = dict(baseline)
        points.append(dict(cur))
        for i in order:
            cur[feats[i]] = x[feats[i]]
            points.append(dict(cur))

    rage_vals = np.asarray(rage_batch(points))
    add_vals = np.asarray(addiction_batch(points))
    rage_contrib = np.zeros(len(feats))
    add_contrib = np.zeros(len(feats))
    step = len(feats) + 1
    for k, order in enumerate(orders):
        r = rage_vals[k * step:(k + 1) * step]
        a = add_vals[k * step:(k + 1) * step]
        for j, i in enumerate(order):
            rage_contrib[i] += r[j + 1] - r[j]
            add_contrib[i] += a[j + 1] - a[j]
    rage_contrib = rage_contrib / n_perm * 100
    add_contrib = add_contrib / n_perm * 100

    rows = []
    for i, feat in enumerate(feats):
        meta = FEATURES[feat]
        value = x[feat]
        why, steps = COPY[feat](value, x)
        rows.append({
            "feature": feat,
            "label": meta["label"],
            "group": meta["group"],
            "value": value,
            "display_value": fmt(feat, value),
            "healthy_range": list(meta["healthy"]),
            "healthy_label": fmt_range(feat),
            "scale": [meta["min"], meta["max"]],
            "worse": meta["worse"],
            "status": status_of(feat, value),
            "tilt_impact": round(float(rage_contrib[i]), 1),
            "addiction_impact": round(float(add_contrib[i]), 1),
            "why": why,
            "steps": steps,
        })
    rows.sort(key=lambda r: max(r["tilt_impact"], r["addiction_impact"]), reverse=True)
    return rows


# ─────────────────────────────────────────────
# PLAN TARGETS & PROJECTION
# Only the habits a player directly controls are changed for the projection.
# ─────────────────────────────────────────────
def plan_targets(x: Dict[str, float]) -> Dict[str, float]:
    t = dict(x)
    t["daily_gaming_hours"] = min(x["daily_gaming_hours"], 3.0)
    t["weekly_sessions"] = min(x["weekly_sessions"], 14)
    t["night_gaming_ratio"] = min(x["night_gaming_ratio"], 0.15)
    t["sleep_hours"] = max(x["sleep_hours"], 7.5)
    t["toxic_exposure"] = min(x["toxic_exposure"], 0.2)
    t["microtransactions_spending"] = min(x["microtransactions_spending"], 30)
    return t


def taper_schedule(hours: float, target: float = 3.0) -> List[Dict]:
    """Week-by-week daily-hours targets, cutting about 20% a week (at least 30 min) until target."""
    weeks = [{"label": "Now", "hours": round(hours, 1)}]
    h = hours
    w = 1
    while h > target and w <= 8:
        h = max(target, round(min(h * 0.8, h - 0.5) * 2) / 2)
        weeks.append({"label": f"Wk {w}", "hours": h})
        w += 1
    return weeks


def warning_signs(x: Dict[str, float]) -> List[Dict]:
    """Behavioural patterns that overlap with WHO gaming-disorder features. Not a diagnosis."""
    signs = [
        ("Hard to control how long you play", x["daily_gaming_hours"] >= 6 or x["weekly_sessions"] >= 30),
        ("Gaming pushing out sleep", x["sleep_hours"] < 6.5 and x["night_gaming_ratio"] >= 0.4),
        ("Gaming taking priority over people", x["social_interaction_score"] <= 3 and x["daily_gaming_hours"] >= 4),
        ("Playing on despite feeling worse", x["depression_score"] >= 6 and x["daily_gaming_hours"] >= 4),
        ("Spending beyond a hobby budget", x["microtransactions_spending"] >= 150),
    ]
    return [{"label": label, "present": bool(present)} for label, present in signs]


SUPPORT_RESOURCES = [
    {"name": "Tele-MANAS (India)", "detail": "Free 24/7 mental-health helpline: call 14416 or 1-800-891-4416"},
    {"name": "NIMHANS SHUT Clinic (Bengaluru)", "detail": "Service for Healthy Use of Technology: specialist help for gaming and internet overuse"},
    {"name": "988 Lifeline (US)", "detail": "Call or text 988, available 24/7"},
    {"name": "Samaritans (UK & Ireland)", "detail": "Call 116 123, free and available 24/7"},
    {"name": "Find a Helpline", "detail": "findahelpline.com lists free, confidential lines in your country"},
]


def build_report(
    x: Dict[str, float],
    rage_fn: Callable,
    addiction_fn: Callable,
    addiction_class_fn: Callable,
    rage_batch: Callable,
    addiction_batch: Callable,
    rage_prob: float,
    rage_level: str,
    add_category: str,
    add_index: float,
) -> Dict:
    drivers = attribute(x, rage_batch, addiction_batch)
    harmful = [d for d in drivers if max(d["tilt_impact"], d["addiction_impact"]) >= 2 and d["status"] != "healthy"]
    protective = [d for d in drivers if d["status"] == "healthy" and min(d["tilt_impact"], d["addiction_impact"]) <= -2]

    targets = plan_targets(x)
    projected = {
        "tilt_probability": round(rage_fn(targets), 4),
        "addiction_index": round(addiction_fn(targets) * 100, 1),
        "addiction_category": addiction_class_fn(targets),
        "changes": [
            {"feature": f, "label": FEATURES[f]["label"], "from": fmt(f, x[f]), "to": fmt(f, targets[f])}
            for f in ["daily_gaming_hours", "weekly_sessions", "night_gaming_ratio", "sleep_hours", "toxic_exposure", "microtransactions_spending"]
            if targets[f] != x[f]
        ],
    }

    # ── Headline & summary ──
    tilt_pct = shown(round(rage_prob, 4) * 100)
    top = harmful[:2]
    top_names = " and ".join(d["label"].lower() for d in top)
    verb = "is" if len(top) == 1 else "are"
    those = "that" if len(top) == 1 else "those"

    # A short headline the room can read at a glance, then one deck line that says what it means.
    if add_category == "High" and rage_level == "HIGH":
        headline, deck = "Both alarms are on.", "You're playing too much, and it's wearing your temper thin."
    elif add_category == "High":
        headline, deck = "Gaming is taking over.", "It's taking up more of your life than is healthy."
    elif rage_level == "HIGH":
        headline, deck = "Tilt is running the show.", "Setbacks knock you off balance more often than you keep control."
    elif add_category == "Medium" or rage_level == "MEDIUM":
        headline, deck = "You're in the warning zone.", "Small changes now will prevent bigger problems later."
    else:
        headline, deck = "Healthy balance.", "You're in control of the game, not the other way round."

    if top:
        body = (
            f"The model puts your tilt (rage-quit) risk at {tilt_pct}% and your addiction level at {add_category.lower()} "
            f"({shown(round(add_index, 1))}/100). The biggest {'driver' if len(top) == 1 else 'drivers'} {verb} {top_names}. "
            f"Bringing {those} into the healthy range is where most of your risk comes down. "
        )
    else:
        body = (
            f"The model puts your tilt (rage-quit) risk at {tilt_pct}% and your addiction level at {add_category.lower()} "
            f"({shown(round(add_index, 1))}/100). None of your habits are pushing your risk up meaningfully. "
        )
    if projected["changes"]:
        body += (
            f"If you follow the plan below, the same model predicts tilt risk drops to "
            f"{shown(projected['tilt_probability'] * 100)}% and addiction to {projected['addiction_category'].lower()} "
            f"({shown(projected['addiction_index'])}/100)."
        )

    next_action = top[0]["steps"][0] if top else "Keep your current routine. Re-check yourself in a month, or sooner if sleep or mood slips."

    # ── Phased plan ──
    plan = []
    today = []
    if x["aggression_score"] >= 6 or rage_level != "LOW":
        today.append({"title": "Set your stop rule", "detail": "Two losses in a row, or you notice you're angry: stop ranked for 30 minutes. Decide it now, before you queue."})
    if x["toxic_exposure"] > 0.25:
        today.append({"title": "Mute chat by default", "detail": "Turn off text and voice chat from agent select and use pings. You can unmute a teammate who's helpful."})
    if x["daily_gaming_hours"] > 3:
        today.append({"title": "Set tonight's limit", "detail": f"Today's cap is {taper_schedule(x['daily_gaming_hours'])[1]['hours'] if len(taper_schedule(x['daily_gaming_hours'])) > 1 else 3:g}h. Set an alarm across the room for when it ends."})
    if x["night_gaming_ratio"] > 0.2 or x["sleep_hours"] < 7:
        today.append({"title": "Last queue at 10:30 PM", "detail": "No new matches after 10:30 PM tonight, whatever the result of the last game."})
    if not today:
        today.append({"title": "Keep your routine", "detail": "Your habits are in a healthy range. Keep the same session lengths and bedtime."})
    plan.append({"phase": "Today", "items": today})

    week = []
    for d in harmful[:3]:
        week.append({"title": d["label"], "detail": d["steps"][0] if len(d["steps"]) == 1 else d["steps"][1]})
    if not week:
        week.append({"title": "Track one week", "detail": "Write down hours played, bedtime and mood each day, so you notice early if anything starts to slide."})
    plan.append({"phase": "Weeks 1–2", "items": week})

    month = []
    if x["daily_gaming_hours"] > 3:
        month.append({"title": "Finish the taper", "detail": "Keep stepping your daily cap down each week (see the schedule) until you're at 3 hours or less on weekdays."})
    if x["social_interaction_score"] < 6 or x["loneliness_score"] > 4:
        month.append({"title": "Rebuild offline time", "detail": "Replace at least two gaming evenings a week with something social: sport, a club, friends."})
    month.append({"title": "Re-run this check", "detail": "Update your numbers after 4 weeks and compare against today's report."})
    plan.append({"phase": "Weeks 3–6", "items": month})

    show_support = x["depression_score"] >= 7 or x["happiness_score"] <= 2.5 or x["anxiety_score"] >= 8 or add_category == "High"
    support_reason = None
    if x["depression_score"] >= 7 or x["happiness_score"] <= 2.5:
        support_reason = "Your mood scores are in a range where talking to a professional really helps. You don't have to sort this out alone."
    elif x["anxiety_score"] >= 8:
        support_reason = "Anxiety this high is worth talking through with a counsellor. It's common and very treatable."
    elif add_category == "High":
        support_reason = "If cutting down feels impossible after a couple of weeks of trying, specialist help for gaming overuse exists and works."

    return {
        "summary": {
            "headline": headline,
            "deck": deck,
            "body": body,
            "next_action": next_action,
            "drivers": [
                {"feature": d["feature"], "label": d["label"], "points": shown(max(d["tilt_impact"], d["addiction_impact"]))}
                for d in top
            ],
        },
        "drivers": drivers,
        "harmful_count": len(harmful),
        "protective": [d["label"] for d in protective],
        "plan": plan,
        "taper": taper_schedule(x["daily_gaming_hours"]),
        "projected": projected,
        "warning_signs": warning_signs(x),
        "support": {"show": show_support, "reason": support_reason, "resources": SUPPORT_RESOURCES},
    }
