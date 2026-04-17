"""
PHASE 2 — Riot API Integration Service
Branch: riot-api

This module is fully wired in this branch.
Import and call fetch_player_features(riot_id, tag_line) from main.py.

Docs:
  https://developer.riotgames.com/apis

API Key:
  Set RIOT_API_KEY in a .env file in the backend/ directory:
    RIOT_API_KEY=RGAPI-xxxx-xxxx-xxxx-xxxx

Rate limits (dev key):
  20 requests/second, 100 requests/2 minutes
  This code fetches 12 calls max per player (1 account + 1 matchlist + 10 matches)
  asyncio.sleep(0.1) keeps us at 10 req/sec — safely under the limit.
"""

import os
import asyncio
import httpx
from typing import Optional, Dict, List
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()

RIOT_API_KEY = os.getenv("RIOT_API_KEY", "")
RIOT_BASE_AMERICAS = "https://americas.api.riotgames.com"

def _headers():
    return {"X-Riot-Token": RIOT_API_KEY}


# ─────────────────────────────────────────────
# STEP 1: Riot ID → PUUID
# ─────────────────────────────────────────────
async def get_puuid(game_name: str, tag_line: str) -> str:
    """Convert Riot ID (name#tag) to PUUID. No OAuth needed for public data."""
    url = f"{RIOT_BASE_AMERICAS}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        return data["puuid"]


# ─────────────────────────────────────────────
# STEP 2: PUUID → Match IDs (Valorant)
# ─────────────────────────────────────────────
async def get_match_ids(puuid: str, count: int = 20) -> List[str]:
    """Get recent Valorant match IDs for a player."""
    url = f"{RIOT_BASE_AMERICAS}/val/match/v1/matchlists/by-puuid/{puuid}"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        return [m["matchId"] for m in data.get("history", [])[:count]]


# ─────────────────────────────────────────────
# STEP 3: Match ID → Full Match Details
# ─────────────────────────────────────────────
async def get_match(match_id: str) -> Dict:
    """Fetch full match data including completionState, players, rounds."""
    url = f"{RIOT_BASE_AMERICAS}/val/match/v1/matches/{match_id}"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=_headers())
        resp.raise_for_status()
        return resp.json()


# ─────────────────────────────────────────────
# STEP 4: Compute Features from Match History
# ─────────────────────────────────────────────
def compute_features(puuid: str, matches: List[Dict]) -> Dict:
    """
    Extract model-ready features from match data.

    Auto-computed (no user input needed):
      - daily_gaming_hours
      - weekly_sessions
      - night_gaming_ratio

    Rage signals (informational, shown in UI):
      - surrender_rate     → proxy for rage-quit events
      - avg_kda            → performance trend

    Cannot compute from Riot API (must be self-reported):
      - stress_level, anxiety_score, sleep_hours, loneliness_score,
        depression_score, happiness_score, social_interaction_score,
        toxic_exposure, microtransactions_spending, years_gaming
    """
    if not matches:
        return {"error": "No match data returned"}

    now = datetime.now(tz=timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    total_ms = 0
    sessions_7d = 0
    night_count = 0
    surrendered = 0
    kda_list = []
    match_datetimes = []

    for match in matches:
        info = match.get("matchInfo", {})

        # Duration
        duration_ms = info.get("gameLengthMillis", 0)
        total_ms += duration_ms

        # Start timestamp
        start_ms = info.get("gameStartMillis", 0)
        if start_ms:
            dt = datetime.fromtimestamp(start_ms / 1000, tz=timezone.utc)
            match_datetimes.append(dt)

            # Night gaming: 10pm (22) to 4am
            if dt.hour >= 22 or dt.hour < 4:
                night_count += 1

            # Weekly sessions
            if dt >= seven_days_ago:
                sessions_7d += 1

        # Surrender detection — this is the key rage-quit signal
        if info.get("completionState") == "Surrendered":
            surrendered += 1

        # KDA for this player specifically
        for player in match.get("players", []):
            if player.get("puuid") == puuid:
                stats = player.get("stats", {})
                k = stats.get("kills", 0)
                d = max(stats.get("deaths", 1), 1)
                a = stats.get("assists", 0)
                kda_list.append((k + a) / d)
                break

    n = len(matches)
    total_hours = total_ms / 3_600_000
    avg_daily_hours = total_hours / 7  # assume window is 7 days
    night_ratio = night_count / n if n else 0
    surrender_ratio = surrendered / n if n else 0
    avg_kda = sum(kda_list) / len(kda_list) if kda_list else 1.0

    # Surrender rate → aggression proxy (informational display only)
    aggression_proxy = round(min(10.0, surrender_ratio * 20), 1)

    # Rage signal flag: surrendered in more than 30% of recent matches
    rage_signal_detected = surrender_ratio >= 0.30

    return {
        # ── Auto-filled into form sliders ──
        "auto_filled": {
            "daily_gaming_hours": round(avg_daily_hours, 2),
            "weekly_sessions": max(1, sessions_7d),
            "night_gaming_ratio": round(night_ratio, 2),
        },
        # ── Shown as contextual info in UI ──
        "riot_insights": {
            "riot_id": None,          # filled in by caller
            "total_matches": n,
            "surrendered_matches": surrendered,
            "surrender_rate": round(surrender_ratio, 2),
            "average_kda": round(avg_kda, 2),
            "night_sessions": night_count,
            "rage_signal_detected": rage_signal_detected,
            "aggression_proxy": aggression_proxy,
        },
        # ── Always requires user self-report ──
        "self_report_required": [
            "stress_level", "anxiety_score", "sleep_hours",
            "loneliness_score", "depression_score", "happiness_score",
            "social_interaction_score", "toxic_exposure",
            "microtransactions_spending", "years_gaming"
        ]
    }


# ─────────────────────────────────────────────
# MAIN ENTRY POINT — called by /fetch-player endpoint
# ─────────────────────────────────────────────
async def fetch_player_features(game_name: str, tag_line: str) -> Dict:
    """
    Full pipeline: Riot ID → PUUID → Match IDs → Match Details → Features.
    Rate-limited to 10 req/sec (asyncio.sleep(0.1) between match fetches).

    Returns dict with auto_filled, riot_insights, and self_report_required.
    """
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not set. Add it to backend/.env")

    # 1. Get PUUID
    puuid = await get_puuid(game_name, tag_line)

    # 2. Get match IDs (last 20)
    match_ids = await get_match_ids(puuid, count=20)

    # 3. Fetch up to 10 match details (rate limit safe)
    matches = []
    for mid in match_ids[:10]:
        try:
            m = await get_match(mid)
            matches.append(m)
            await asyncio.sleep(0.1)    # 10 req/sec — stays under 20/sec dev limit
        except httpx.HTTPStatusError:
            pass    # Skip failed matches, continue with rest

    # 4. Compute features
    features = compute_features(puuid, matches)
    features["riot_insights"]["riot_id"] = f"{game_name}#{tag_line}"
    features["puuid"] = puuid

    return features
