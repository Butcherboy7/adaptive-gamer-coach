---
name: Adaptive Gamer Coach
description: A dark, broadcast-style report on one player's anger risk and gaming habits, explained factor by factor in plain words.
colors:
  ground: "#0c0f13"
  sheet: "#141920"
  sheet-2: "#1b2129"
  sheet-3: "#222a33"
  line: "#262e37"
  ink: "#ece8df"
  ink-2: "#a9b1b9"
  ink-3: "#858e97"
  bone: "#f1ede4"
  red: "#ff4655"
  red-deep: "#c42634"
  ok: "#3fd9a3"
  watch: "#f2a93b"
  risk: "#ff7380"
typography:
  display: "'Big Shoulders Display', sans-serif (caps, titles and big numbers)"
  family: "'Archivo Variable', 'Segoe UI', system-ui, sans-serif"
  body: { fontSize: "15px", fontWeight: 400, lineHeight: 1.55 }
  label: { fontSize: "12px", fontWeight: 650, caps: true, tracking: "0.06em", width: "condensed" }
rounded:
  sheet: "2px"
  control: "2px"
---

# Design System: Adaptive Gamer Coach

## Overview
Graphite plates on a near-black ground, a bone verdict plate with a red "Do this first" strip, signal red for the primary action. This is the original Valorant-flavoured look, kept on purpose, with the new structure and plain wording underneath. Green, amber and red are risk status only and always come with a word (Low / Medium / High, Healthy / Watch / Off track).

## Rules
- Big Shoulders Display in caps for titles, scores and numbers; Archivo for everything you read.
- Slanted cuts (clip-path, skew) on section tabs, the verdict plate, score tags and bands. Everything else is square.
- The bone plate carries the verdict; the red strip carries the one next step. Red also marks the primary button.
- One idea per screen: pick a player, move sliders, read the result. Wording is plain: "anger risk", never "tilt".
- Every number comes from the model or the inputs; values estimated from the six manual questions are tagged Estimated or Typical.

## Layout
Top bar (wordmark, Riot ID search once a report is open, API status). Empty state: title and a three-step picture (pick, sliders, plan). Manual entry: six questions with a live result box. With a player: sticky left column (profile and live inputs), right column verdict, two score sheets, problems list, plan, warning signs and help, model card.
