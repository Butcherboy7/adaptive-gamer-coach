"""
Valorant player database (synthetic dataset).

Every profile is synthetic. Each player is generated from a behavioural archetype so that
their Valorant stats, match history and wellbeing check-in agree with each other
(a night-owl's matches really are late at night, a tilted climber really does surrender more).
Generation is seeded by the Riot ID, so the same name always returns the same profile,
and any Riot ID that isn't in the list gets a stable generated profile too.
"""

import hashlib
import math
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

# ─────────────────────────────────────────────
# NAMES  (game name, tag, region)
# ─────────────────────────────────────────────
NAMED_PLAYERS = [
    ("kyuu", "0711", "AP"), ("sleepy jett", "zzz", "NA"), ("mochi", "NA1", "NA"), ("lowkey", "4421", "NA"),
    ("Ashen", "EUW", "EU"), ("rhea", "moon", "EU"), ("dumpling", "bao", "NA"), ("no peek", "1v5", "NA"),
    ("Kairos", "TR1", "EU"), ("hana", "kr1", "KR"), ("vandal only", "tap", "EU"), ("baguette", "FR33", "EU"),
    ("Lumen", "0042", "EU"), ("quiet storm", "NA1", "NA"), ("Pyre", "burn", "NA"), ("soft aim", "help", "NA"),
    ("wren", "8833", "EU"), ("eclipse", "ttv", "NA"), ("lil sova", "dart", "NA"), ("별빛", "KR1", "KR"),
    ("하루", "0505", "KR"), ("さくら", "JP1", "AP"), ("雪", "yuki", "AP"), ("Joãozinho", "BR1", "BR"),
    ("Çağan", "TR1", "EU"), ("Łukasz", "PL22", "EU"), ("ñandú", "LAS", "LATAM"), ("tilted tom", "lol", "EU"),
    ("Juno", "1999", "NA"), ("Saffron", "spice", "EU"), ("orbit", "0101", "NA"), ("cloudy", "rain", "EU"),
    ("Vex", "NA1", "NA"), ("pebble", "rock", "NA"), ("ShiroNeko", "nyan", "AP"), ("dante", "inf", "EU"),
    ("matcha latte", "oat", "AP"), ("RIZZLER", "fps", "NA"), ("nightshift", "3am", "NA"), ("bonk", "bat", "NA"),
    ("Marisol", "LAN", "LATAM"), ("Thiago", "BR1", "BR"), ("cafezinho", "BR2", "BR"), ("Gabi", "gg", "BR"),
    ("Ishaan", "IND", "AP"), ("Aarav", "007", "AP"), ("Rohit", "SEA", "AP"), ("Meera", "ap1", "AP"),
    ("Priya", "SEA", "AP"), ("Kabir", "2003", "AP"), ("anaya", "shh", "AP"), ("Dev", "IN1", "AP"),
    ("chai break", "brb", "AP"), ("biryani", "spicy", "AP"), ("Arjun", "aim", "AP"), ("zaid", "0786", "AP"),
    ("Tanvi", "2201", "AP"), ("Vihaan", "IN1", "AP"), ("Rhys", "UK1", "EU"), ("Freya", "EUW", "EU"),
    ("Mats", "NOR", "EU"), ("Elif", "TR1", "EU"), ("Nikolai", "RU1", "EU"), ("Sven", "SWE", "EU"),
    ("pierre", "ange", "EU"), ("Lotte", "NL1", "EU"), ("Kenji", "JP1", "AP"), ("Haruto", "0330", "AP"),
    ("Mei", "TW1", "AP"), ("Linh", "VN1", "AP"), ("Bayu", "ID1", "AP"), ("Arif", "MY1", "AP"),
    ("Paolo", "PH1", "AP"), ("Kai", "OCE", "AP"), ("Nate", "AUS", "AP"), ("Mia", "OCE", "AP"),
    ("Jae", "kr2", "KR"), ("Minseo", "kr1", "KR"), ("Doyun", "0815", "KR"), ("Seojin", "kr1", "KR"),
    ("ghostpepper", "hot", "NA"), ("frostbite", "NA1", "NA"), ("tofu", "cube", "NA"), ("bluebell", "4040", "NA"),
    ("Odin", "NA1", "NA"), ("Ezra", "2412", "NA"), ("Nico", "NA2", "NA"), ("Ava", "bunny", "NA"),
    ("Liam", "NA1", "NA"), ("Zoe", "zz", "NA"), ("mango", "ripe", "NA"), ("pixel", "8bit", "NA"),
    ("deadeye", "hs", "NA"), ("one tap", "tap", "NA"), ("crosshair", "0", "NA"), ("rattata", "top", "NA"),
    ("waffle", "syrup", "NA"), ("noodle", "ramen", "NA"), ("cinnamon", "roll", "NA"), ("starboy", "xo", "NA"),
    ("Iris", "EUW", "EU"), ("Felix", "DE1", "EU"), ("Clara", "ES1", "EU"), ("Matteo", "IT1", "EU"),
    ("Leon", "DE2", "EU"), ("Ines", "PT1", "EU"), ("Hugo", "FR1", "EU"), ("Nora", "EUNE", "EU"),
    ("Valentina", "LAS", "LATAM"), ("Santi", "LAN", "LATAM"), ("Camila", "MX1", "LATAM"), ("Diego", "ARG", "LATAM"),
    ("Lucas", "BR1", "BR"), ("Rafa", "BR1", "BR"), ("Bia", "br3", "BR"), ("Caio", "BR1", "BR"),
    ("smoke diff", "omen", "NA"), ("heal me pls", "sage", "EU"), ("lurk god", "cyph", "NA"), ("entry", "go", "EU"),
    ("support main", "pls", "NA"), ("igl", "call", "EU"), ("flash out", "kayo", "NA"), ("wall diff", "sage", "AP"),
    ("6am ranked", "why", "NA"), ("one more game", "pls", "EU"), ("last game fr", "fr", "NA"), ("touch grass", "soon", "EU"),
    ("Riya", "AP1", "AP"), ("Nadia", "ME1", "EU"), ("Omar", "ME1", "EU"), ("Yusuf", "TR2", "EU"),
    ("Sana", "PK1", "AP"), ("Ali", "PK1", "AP"), ("Hamza", "1122", "EU"), ("Layla", "moon", "EU"),
    ("velvet", "red", "NA"), ("ember", "ash", "EU"), ("halcyon", "calm", "EU"), ("solstice", "sun", "NA"),
    ("tempest", "gale", "AP"), ("nimbus", "sky", "AP"), ("cobalt", "blue", "EU"), ("onyx", "dark", "NA"),
]

REGION_LABEL = {"NA": "North America", "EU": "Europe", "AP": "Asia Pacific", "KR": "Korea", "BR": "Brazil", "LATAM": "Latin America"}

RANKS = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"]
RANK_WEIGHTS = [8, 15, 20, 20, 15, 10, 7, 4, 1]

AGENTS = {
    "Duelist": ["Jett", "Reyna", "Raze", "Phoenix", "Yoru", "Neon", "Iso", "Waylay"],
    "Initiator": ["Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko", "Tejo"],
    "Controller": ["Omen", "Brimstone", "Viper", "Astra", "Harbor", "Clove"],
    "Sentinel": ["Sage", "Killjoy", "Cypher", "Chamber", "Deadlock", "Vyse"],
}
AGENT_ROLE = {a: role for role, agents in AGENTS.items() for a in agents}
MAPS = ["Ascent", "Bind", "Haven", "Split", "Lotus", "Sunset", "Icebox", "Breeze", "Abyss", "Pearl", "Fracture"]

# ─────────────────────────────────────────────
# ARCHETYPES  — (lo, hi) ranges for each wellbeing / habit input
# ─────────────────────────────────────────────
ARCHETYPES = {
    "balanced": {
        "weight": 24, "daily_gaming_hours": (1, 2.5), "weekly_sessions": (4, 10), "night_gaming_ratio": (0.05, 0.2),
        "sleep_hours": (7, 8.5), "toxic_exposure": (0.1, 0.3), "microtransactions_spending": (0, 25),
        "stress_level": (2, 4), "anxiety_score": (1, 3.5), "aggression_score": (1.5, 4), "depression_score": (0.5, 2.5),
        "happiness_score": (6.5, 9), "loneliness_score": (1, 3.5), "social_interaction_score": (6, 9),
    },
    "weekend": {
        "weight": 10, "daily_gaming_hours": (1.5, 3), "weekly_sessions": (3, 7), "night_gaming_ratio": (0.2, 0.4),
        "sleep_hours": (7, 8), "toxic_exposure": (0.2, 0.4), "microtransactions_spending": (10, 50),
        "stress_level": (3, 5), "anxiety_score": (2, 4), "aggression_score": (2, 5), "depression_score": (1, 3),
        "happiness_score": (6, 8), "loneliness_score": (2, 4), "social_interaction_score": (6, 8.5),
    },
    "grinder": {
        "weight": 18, "daily_gaming_hours": (5, 9), "weekly_sessions": (22, 38), "night_gaming_ratio": (0.35, 0.65),
        "sleep_hours": (5.5, 7), "toxic_exposure": (0.3, 0.5), "microtransactions_spending": (30, 120),
        "stress_level": (4, 6.5), "anxiety_score": (3, 5.5), "aggression_score": (3.5, 6), "depression_score": (2, 4.5),
        "happiness_score": (5, 7), "loneliness_score": (3.5, 6), "social_interaction_score": (3, 5.5),
    },
    "tilted": {
        "weight": 16, "daily_gaming_hours": (3, 6), "weekly_sessions": (14, 26), "night_gaming_ratio": (0.3, 0.55),
        "sleep_hours": (5.5, 7), "toxic_exposure": (0.55, 0.85), "microtransactions_spending": (10, 70),
        "stress_level": (7, 9), "anxiety_score": (5, 7.5), "aggression_score": (6.5, 9), "depression_score": (2.5, 5),
        "happiness_score": (4, 6), "loneliness_score": (3, 6), "social_interaction_score": (4, 6.5),
    },
    "night_owl": {
        "weight": 13, "daily_gaming_hours": (4, 7), "weekly_sessions": (15, 28), "night_gaming_ratio": (0.65, 0.9),
        "sleep_hours": (4.5, 6.2), "toxic_exposure": (0.35, 0.6), "microtransactions_spending": (10, 60),
        "stress_level": (5, 7.5), "anxiety_score": (4, 6.5), "aggression_score": (4, 6.5), "depression_score": (3, 5.5),
        "happiness_score": (4, 6), "loneliness_score": (4, 6.5), "social_interaction_score": (3.5, 5.5),
    },
    "escapist": {
        "weight": 11, "daily_gaming_hours": (6, 10.5), "weekly_sessions": (25, 42), "night_gaming_ratio": (0.5, 0.8),
        "sleep_hours": (4.5, 6.5), "toxic_exposure": (0.3, 0.55), "microtransactions_spending": (20, 110),
        "stress_level": (5.5, 8), "anxiety_score": (5.5, 8), "aggression_score": (3, 5.5), "depression_score": (5.5, 8.2),
        "happiness_score": (2, 4), "loneliness_score": (7, 9.2), "social_interaction_score": (1, 3),
    },
    "collector": {
        "weight": 5, "daily_gaming_hours": (3.5, 6.5), "weekly_sessions": (15, 28), "night_gaming_ratio": (0.3, 0.55),
        "sleep_hours": (6, 7.5), "toxic_exposure": (0.2, 0.45), "microtransactions_spending": (160, 450),
        "stress_level": (3.5, 6), "anxiety_score": (3, 5.5), "aggression_score": (3, 5), "depression_score": (2, 4.5),
        "happiness_score": (5, 7), "loneliness_score": (3, 6), "social_interaction_score": (4, 6.5),
    },
    "recovering": {
        "weight": 3, "daily_gaming_hours": (2, 3.5), "weekly_sessions": (8, 14), "night_gaming_ratio": (0.1, 0.25),
        "sleep_hours": (6.8, 8), "toxic_exposure": (0.15, 0.3), "microtransactions_spending": (0, 20),
        "stress_level": (3.5, 5.5), "anxiety_score": (3, 5), "aggression_score": (2.5, 4.5), "depression_score": (2.5, 4.5),
        "happiness_score": (5.5, 7.5), "loneliness_score": (3, 5), "social_interaction_score": (5, 7.5),
    },
}

STEPS = {
    "daily_gaming_hours": 0.5, "weekly_sessions": 1, "night_gaming_ratio": 0.05, "sleep_hours": 0.5,
    "toxic_exposure": 0.05, "microtransactions_spending": 5, "stress_level": 1, "anxiety_score": 0.1,
    "aggression_score": 0.1, "depression_score": 0.1, "happiness_score": 0.1, "loneliness_score": 0.1,
    "social_interaction_score": 0.1,
}


def _seed(text: str) -> int:
    return int(hashlib.sha256(text.lower().encode("utf-8")).hexdigest()[:12], 16)


def _snap(value: float, step: float) -> float:
    v = round(value / step) * step
    return int(round(v)) if step >= 1 else round(v, 2)


def _rank(rng: random.Random, archetype: str) -> Dict:
    weights = list(RANK_WEIGHTS)
    if archetype in ("grinder", "escapist"):
        weights = [w * m for w, m in zip(weights, [0.3, 0.5, 0.8, 1, 1.3, 1.6, 2, 2.5, 3])]
    if archetype in ("balanced", "weekend"):
        weights = [w * m for w, m in zip(weights, [1.4, 1.4, 1.2, 1.1, 0.9, 0.6, 0.4, 0.2, 0.05])]
    idx = rng.choices(range(len(RANKS)), weights=weights)[0]
    tier = None if RANKS[idx] == "Radiant" else rng.randint(1, 3)
    rr = rng.randint(0, 99) if RANKS[idx] not in ("Immortal", "Radiant") else rng.randint(40, 520)
    peak_idx = min(len(RANKS) - 1, idx + rng.choices([0, 0, 1, 1, 2], k=1)[0])
    peak_tier = None if RANKS[peak_idx] == "Radiant" else (rng.randint(tier or 1, 3) if peak_idx == idx else rng.randint(1, 3))
    return {
        "rank": RANKS[idx], "tier": tier, "rr": rr, "rank_index": idx,
        "peak_rank": RANKS[peak_idx], "peak_tier": peak_tier,
    }


def _match_hour(rng: random.Random, night_ratio: float) -> int:
    if rng.random() < night_ratio:
        return rng.choice([22, 22, 23, 23, 0, 0, 1, 1, 2, 3])
    return rng.choice([12, 14, 15, 16, 17, 18, 18, 19, 19, 20, 20, 21, 21])


def build_profile(game_name: str, tag: str, region: Optional[str] = None, generated: bool = False) -> Dict:
    riot_id = f"{game_name}#{tag}"
    rng = random.Random(_seed(riot_id))

    names = list(ARCHETYPES)
    region = region or rng.choice(list(REGION_LABEL))
    archetype = rng.choices(names, weights=[ARCHETYPES[n]["weight"] for n in names])[0]
    arc = ARCHETYPES[archetype]

    inputs = {}
    for key, step in STEPS.items():
        lo, hi = arc[key]
        inputs[key] = _snap(rng.uniform(lo, hi), step)

    rank = _rank(rng, archetype)
    years = rng.randint(1, 4) if rank["rank_index"] <= 2 else rng.randint(2, 12)
    inputs["years_gaming"] = years

    ri = rank["rank_index"]
    # Valorant performance stats scale with rank; tilt drags win rate and K/D
    tilt_drag = 0.06 if archetype == "tilted" else 0.0
    kd = round(max(0.55, rng.gauss(0.82 + ri * 0.07 - tilt_drag, 0.08)), 2)
    hs = round(min(38, max(9, rng.gauss(13 + ri * 2.3, 2.2))), 1)
    acs = int(max(130, rng.gauss(170 + ri * 13 - tilt_drag * 200, 14)))
    win_rate = round(min(62, max(40, rng.gauss(50.5 + (ri - 4) * 0.5 - tilt_drag * 60, 2.5))), 1)

    games_per_session = rng.uniform(2.0, 3.2)
    matches_7d = max(1, int(inputs["weekly_sessions"] * games_per_session * (0.6 if archetype == "weekend" else 1)))
    valorant_share = rng.uniform(0.7, 0.95)
    hours_30d = int(inputs["daily_gaming_hours"] * 30 * valorant_share)
    account_level = int(min(620, 20 + years * rng.uniform(25, 45) + hours_30d * 0.15))

    role_weights = {"Duelist": 4, "Initiator": 3, "Controller": 3, "Sentinel": 2}
    main_role = rng.choices(list(role_weights), weights=list(role_weights.values()))[0]
    main_agents = rng.sample(AGENTS[main_role], 2) + rng.sample([a for r, ags in AGENTS.items() if r != main_role for a in ags], 1)
    picks = sorted([rng.uniform(30, 55), rng.uniform(15, 28), rng.uniform(6, 14)], reverse=True)
    agents = [{"name": a, "role": AGENT_ROLE[a], "pick_rate": round(p)} for a, p in zip(main_agents, picks)]

    # Recent matches — newest first. Surrenders are more common for tilted players.
    surrender_rate = {"tilted": 0.22, "night_owl": 0.1, "escapist": 0.08}.get(archetype, 0.04)
    now = datetime(2026, 10, 11, 21, 30, tzinfo=timezone.utc)
    matches = []
    day_offset = 0
    for i in range(12):
        if i and rng.random() < 0.35:
            day_offset += rng.choice([0, 1, 1, 2])
        hour = _match_hour(rng, inputs["night_gaming_ratio"])
        start = (now - timedelta(days=day_offset)).replace(hour=hour, minute=rng.choice([5, 12, 24, 37, 48, 55]))
        won = rng.random() < win_rate / 100
        surrendered = (not won) and rng.random() < surrender_rate * 2.2
        if won:
            score = (13, rng.randint(3, 11)) if rng.random() > 0.15 else (rng.choice([14, 15]), rng.choice([12, 13]))
        elif surrendered:
            score = (rng.randint(1, 5), rng.randint(8, 12))
        else:
            score = (rng.randint(3, 11), 13)
        agent = rng.choices([a["name"] for a in agents], weights=[a["pick_rate"] for a in agents])[0]
        rounds = sum(score)
        kills = max(0, int(rng.gauss(rounds * 0.72 * kd / (kd + 0.1) * (1.15 if won else 0.85), 3)))
        deaths = max(1, int(rng.gauss(rounds * 0.72 * (0.85 if won else 1.1), 2.5)))
        matches.append({
            "map": rng.choice(MAPS),
            "agent": agent,
            "result": "W" if won else "L",
            "score": f"{score[0]}–{score[1]}",
            "kda": f"{kills}/{deaths}/{max(0, int(rng.gauss(rounds * 0.25, 2)))}",
            "acs": int(max(80, rng.gauss(acs * (1.15 if won else 0.88), 30))),
            "started_at": start.isoformat(),
            "hour": hour,
            "surrendered": surrendered,
        })

    # Play-time distribution by hour of day (share of matches), consistent with night ratio
    by_hour = [0.0] * 24
    for _ in range(400):
        by_hour[_match_hour(rng, inputs["night_gaming_ratio"])] += 1
    by_hour = [round(v / 400, 3) for v in by_hour]

    return {
        "riot_id": riot_id,
        "game_name": game_name,
        "tag": tag,
        "region": region,
        "region_label": REGION_LABEL[region],
        "archetype": archetype,
        "generated": generated,
        "updated_minutes_ago": rng.randint(2, 55),
        "rank": rank,
        "account_level": account_level,
        "stats": {
            "kd": kd, "hs_pct": hs, "acs": acs, "win_rate": win_rate,
            "matches_7d": matches_7d, "hours_30d": hours_30d,
            "surrenders_10": sum(1 for m in matches[:10] if m["surrendered"]),
        },
        "agents": agents,
        "matches": matches[:10],
        "by_hour": by_hour,
        "inputs": inputs,
    }


_DB: Dict[str, Dict] = {}
for _name, _tag, _region in NAMED_PLAYERS:
    _p = build_profile(_name, _tag, _region)
    _DB[_p["riot_id"].lower()] = _p


def _summary(p: Dict) -> Dict:
    return {
        "riot_id": p["riot_id"], "game_name": p["game_name"], "tag": p["tag"],
        "region": p["region"], "rank": p["rank"], "main_agent": p["agents"][0]["name"],
        "account_level": p["account_level"], "win_rate": p["stats"]["win_rate"],
    }


def search(query: str, limit: int = 8) -> List[Dict]:
    q = query.strip().lower()
    if not q:
        # A stable "featured" set spanning different risk profiles
        featured = ["sleepy jett#zzz", "kyuu#0711", "one more game#pls", "ishaan#ind", "별빛#kr1", "tilted tom#lol", "nightshift#3am", "joãozinho#br1"]
        return [_summary(_DB[k]) for k in featured if k in _DB][:limit]
    name_q, _, tag_q = q.partition("#")
    scored = []
    for key, p in _DB.items():
        name, tag = p["game_name"].lower(), p["tag"].lower()
        if tag_q and not tag.startswith(tag_q):
            continue
        if name.startswith(name_q):
            scored.append((0, len(name), key))
        elif name_q in name:
            scored.append((1, len(name), key))
    scored.sort()
    return [_summary(_DB[k]) for _, _, k in scored[:limit]]


def lookup(riot_id: str) -> Dict:
    key = riot_id.strip().lower()
    if key in _DB:
        return _DB[key]
    name, _, tag = riot_id.strip().partition("#")
    tag = tag.strip() or "NA1"
    return build_profile(name.strip() or "player", tag, region=_region_from_tag(tag), generated=True)


TAG_REGIONS = [
    ("EUW", "EU"), ("EUNE", "EU"), ("EU", "EU"), ("TR", "EU"), ("RU", "EU"), ("UK", "EU"), ("DE", "EU"), ("FR", "EU"),
    ("NA", "NA"), ("US", "NA"), ("KR", "KR"), ("BR", "BR"), ("LAN", "LATAM"), ("LAS", "LATAM"), ("MX", "LATAM"),
    ("OCE", "AP"), ("AUS", "AP"), ("JP", "AP"), ("SEA", "AP"), ("IN", "AP"), ("PH", "AP"), ("SG", "AP"),
]


def _region_from_tag(tag: str) -> Optional[str]:
    """Riot tags often name a region (#EUW, #KR1). Use it so a lookup doesn't land on the wrong server."""
    t = tag.upper()
    for prefix, region in TAG_REGIONS:
        if t.startswith(prefix):
            return region
    return None
