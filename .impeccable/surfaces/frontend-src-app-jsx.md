---
version: 1
slug: "frontend-src-app-jsx"
primary_target: "frontend/src/App.jsx"
related_targets: []
---

# Surface brief: Coach dashboard (frontend/src/App.jsx)

Scope: the whole single-page dashboard (search, player sheet, inputs, report). Visitor mode: Operate.
Audience: university review panel watching a live demo on a laptop/projector; implied user is a Valorant player checking themselves.
Task: find a player (or enter stats manually), run the analysis, read an explained verdict and a personalised recovery plan.
Content: model outputs from FastAPI (/predict) incl. per-factor attributions, plan, taper, projection; synthetic demo player database (labelled as demo).
Constraints: every number shown must come from the model or inputs; no decorative fake charts; coach-like warm direct voice; severe mood routes to real help.
Memorable moment: the "You vs Healthy" head-to-head factor bars and the Now vs After-plan matchup.

## Direction contract

THESIS: The report is a broadcast segment about one player: a player card, a lower-third verdict, and head-to-head stat bars against the healthy baseline. It refuses the neon-glow dark HUD and generic stat-tile grid.

OWN-WORLD: Graphite broadcast ink (#0d1014 ground, #161b21 plates), bone plates (#f1ede4) carrying dark text for the verdict lower-third, signal red (#ff4655) for risk and the primary action only, field green (#21c48d) for healthy, amber (#f2a93b) for watch. Solid flat plates, 6–8° angled cuts on plate corners and tabs, no glows, no gradients, no glass. Big Shoulders Display for scores and headings in caps; Archivo (narrow width for labels, normal for prose).

STORY: The reviewer picks a real-looking player and the report runs at once (no Analyze button: inputs re-score live on every change, debounced ~220ms, because watching scores move as a slider drags demonstrates the model better than a submit step); they immediately read one verdict sentence and two scores, understands which factors cause them, and sees a dated plan and a predicted after-plan result from the same model.

FIRST VIEWPORT: Top bar: wordmark left, Riot ID search centre, API status right. Left column (~380px): player card (rank, agent, region, K/D, HS%, win rate, hours, last 10 matches strip), then inputs. Right: bone lower-third verdict across the top with the next action, two score plates (tilt %, addiction index) side by side, then the You vs Healthy factor board. The left column is sticky on desktop (player card + live inputs scroll inside it).

FORM: Broadcast Package (esports tournament graphics), my list position 1, chosen as IMPECCABLE'S PICK; seed key 25bad10d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
