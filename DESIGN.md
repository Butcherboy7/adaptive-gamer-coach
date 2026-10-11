---
name: Adaptive Gamer Coach
description: A broadcast-segment report on one Valorant player's tilt and gaming-addiction risk, explained factor by factor.
colors:
  ground: "#0c0f13"
  plate: "#141920"
  plate-2: "#1b2129"
  plate-3: "#222a33"
  line: "#262e37"
  line-2: "#36414c"
  text: "#ece8df"
  text-2: "#a9b1b9"
  text-3: "#858e97"
  bone: "#f1ede4"
  bone-ink: "#14181d"
  signal-red: "#ff4655"
  signal-red-deep: "#c42634"
  signal-red-text: "#ff7380"
  field-green: "#21c48d"
  field-green-text: "#3fd9a3"
  watch-amber: "#f2a93b"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Archivo Variable', sans-serif"
    fontSize: "clamp(48px, 6.4vw, 92px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0"
  headline:
    fontFamily: "'Big Shoulders Display', 'Archivo Variable', sans-serif"
    fontSize: "clamp(30px, 3.4vw, 46px)"
    fontWeight: 800
    lineHeight: 0.98
  score:
    fontFamily: "'Big Shoulders Display', 'Archivo Variable', sans-serif"
    fontSize: "76px"
    fontWeight: 800
    lineHeight: 0.85
  title:
    fontFamily: "'Big Shoulders Display', 'Archivo Variable', sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  body:
    fontFamily: "'Archivo Variable', 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "'Archivo Variable', 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 650
    letterSpacing: "0.06em"
    fontVariation: "'wdth' 72"
rounded:
  plate: "2px"
  thumb: "1px"
spacing:
  gap: "20px"
  plate-y: "22px"
  plate-x: "24px"
  page-x: "28px"
  page-x-mobile: "16px"
  slant: "12px"
components:
  plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.text}"
    rounded: "{rounded.plate}"
    padding: "22px 24px"
  section-tab:
    backgroundColor: "{colors.plate-3}"
    textColor: "{colors.text}"
    typography: "{typography.title}"
    padding: "9px 34px 7px 24px"
  verdict-lower-third:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.bone-ink}"
    typography: "{typography.headline}"
    padding: "24px 72px 24px 28px"
  next-action-strip:
    backgroundColor: "{colors.signal-red-deep}"
    textColor: "#ffffff"
    padding: "14px 64px 15px 28px"
  button-quiet:
    textColor: "{colors.text-2}"
    rounded: "{rounded.plate}"
    padding: "6px 10px"
  button-quiet-hover:
    backgroundColor: "{colors.plate-3}"
    textColor: "{colors.text}"
  input-search:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.text}"
    rounded: "{rounded.plate}"
    height: "44px"
    padding: "0 44px 0 42px"
  input-search-focus:
    backgroundColor: "{colors.plate-2}"
  score-level-tag:
    textColor: "{colors.bone-ink}"
    typography: "{typography.label}"
    padding: "3px 11px 2px"
  chip-status:
    typography: "{typography.label}"
    rounded: "{rounded.plate}"
    padding: "2px 7px 1px"
  pick-card:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.plate}"
    padding: "12px 14px"
  pick-card-hover:
    backgroundColor: "{colors.plate-3}"
---

# Design System: Adaptive Gamer Coach

## Overview

**Creative North Star: "The Broadcast Package"**

The interface is an esports tournament graphics package pointed at one player. A player card introduces them, a bone lower-third delivers the verdict, and head-to-head stat bars set them against a healthy baseline the way a caster's overlay sets two teams against each other. Everything sits on graphite ink: solid, flat plates stacked on a near-black ground, separated by tone and hairlines rather than by light.

Geometry carries the identity. Tabs, tags, chips, plates and meter steps are cut on a consistent forward slant, so the whole page leans in the same direction like a broadcast wipe. Type is split cleanly: Big Shoulders Display in condensed caps for everything that is announced (headings, scores, numerals), Archivo for everything that is read, with its width axis pulled narrow for labels and left at normal width for prose.

Colour is semantic before it is decorative. Signal red means risk or the one action to take; field green means healthy; amber means watch. Bone is reserved for the verdict and for the instruments the user holds (slider thumbs, focus rings, the budget line). The system refuses the neon-glow dark HUD and the generic stat-tile grid: no glows, no glass, no decorative gradients.

**Key Characteristics:**
- Flat graphite plates on a near-black ground; depth by tonal step, not shadow.
- One forward slant (12px cut on tabs, 30px on the verdict, -12 to -14deg skew on meters and dividers) repeated everywhere.
- Condensed display caps for announced content; Archivo at two widths for labels and prose.
- Red, green and amber are status semantics, never ornament.
- Bone lower-third is the single light surface on the page.
- Wipe-in motion on a long ease-out; everything collapses to instant under reduced motion.

## Colors

A graphite broadcast palette with one bone surface and three status signals.

### Primary
- **Signal Red** (signal-red): risk state, lit risk meter steps, losses in the match strip, push-toward-risk bars, the brand mark's inner wedge, selection highlight and caret. **Signal Red Deep** (signal-red-deep) backs the "Do this first" next-action strip, where white text must hold contrast. **Signal Red Text** (signal-red-text) is the readable tint for red numerals and labels on graphite.

### Secondary
- **Field Green** (field-green): healthy state, the healthy-range band on sliders and head-to-head lanes, wins, protective factors, the online status dot. **Field Green Text** (field-green-text) for green numerals on graphite.

### Tertiary
- **Watch Amber** (watch-amber): the middle band of every risk scale, late-night hours, forfeits, the urgent support panel heading, and the "generated profile" notice. Amber is used directly as text; it already reads on graphite.

### Neutral
- **Broadcast Ground** (ground): page background and the cut lines between matchup halves.
- **Graphite Plate** (plate): every section plate, the search field, pick cards.
- **Raised Plate** (plate-2): open factor rows, matchup board, dropdowns, support panel, chart backgrounds.
- **Tab Plate** (plate-3): section heading tabs, hover fills, empty meter steps and lane tracks.
- **Hairline** (line) and **Strong Hairline** (line-2): row dividers, stat-strip rules, axes, input borders.
- **Paper Text** (text), **Muted Text** (text-2), **Quiet Text** (text-3): primary copy, secondary copy, labels and metadata.
- **Bone** (bone) with **Bone Ink** (bone-ink): the verdict lower-third and its dark text; bone alone marks focus rings, slider thumbs, the wordmark's "Coach" and the plan's budget line.

### Named Rules
**The Signal Rule.** Red, green and amber always mean risk, healthy and watch. Never use them for decoration, category coding or brand flourish; a red element must be either a risk reading or the single next action.

**The One Bone Surface Rule.** Bone is the only light fill on the page and belongs to the verdict lower-third. Elsewhere bone appears only as a line or a small instrument (thumb, focus ring, dashed budget line), never as a second light plate.

**The Text-Tint Rule.** Status colours set as text on graphite use their `-text` tint (signal-red-text, field-green-text); the saturated base is for fills and bars.

## Typography

**Display Font:** Big Shoulders Display 700/800 (with Archivo Variable fallback), self-hosted.
**Body Font:** Archivo Variable with the wdth axis (with Segoe UI fallback), self-hosted.

**Character:** A tall, condensed sports-graphics face shouting in caps over a sturdy grotesque that narrows for labels and relaxes for reading. The pairing reads like a scoreboard with footnotes.

### Hierarchy
- **Display** (800, clamp(48px, 6.4vw, 92px), 0.9, uppercase): the empty-state invitation only.
- **Headline** (800, clamp(36px, 4.2vw, 58px), 0.95, uppercase, max 22ch, balanced): the short verdict headline on the lower-third, followed by an 18px deck line in Archivo 500.
- **Score** (800, 76px / 64px mobile, 0.85): the two headline numbers; units drop to 0.42em in muted text. Matchup numerals use the same voice at 44px, player name at 34px, stat-strip numerals at 21px.
- **Title** (800, 28px / 24px mobile, 1, uppercase): section heading tabs. Sub-section heads (plan phases, support, model card, factor "How to fix it") use the same face at 17 to 26px.
- **Body** (400, 15px / 14.5px mobile, 1.55, wdth 100): prose, capped at 72 to 76ch; secondary prose at 14 to 14.5px in muted text.
- **Label** (650, 12px, 0.06em, uppercase, wdth 72): column heads, stat names, captions, legends, small tags (11 to 13px variants).

### Named Rules
**The Two Widths Rule.** Archivo runs narrow (wdth 72 to 75) only in uppercase labels and tags; prose always stays at wdth 100.

**The Announced Numeral Rule.** Any number the model produced and the user should read at a glance is set in Big Shoulders Display with tabular figures; supporting numbers in rows stay in Archivo.

## Layout

A two-column operating layout inside a 1480px max container: a 340 to 400px left column (player card, then live inputs) and a fluid report column, separated by a 20px gap that also spaces every plate in both columns. On desktop (above 960px) the left column is sticky under the 92px top region and scrolls internally, with a 28px fade mask at its foot. The top bar is a sticky three-part grid: wordmark, centred search capped at 560px, API status.

At 960px and below the columns collapse to one, the top bar wraps search onto its own row, and the order becomes player card, report, inputs. At 640px plates tighten to 18px by 16px padding, the stat strip drops from six columns to three, scores stack, and the factor board drops its column heads and stacks each factor's lanes under its name.

Rhythm is plate-based: 22px by 24px plate padding, 18px under section heads, 20px between sub-blocks inside a plate, 28px page gutters (16px mobile). Inside plates, rows divide with hairlines rather than gaps.

## Elevation & Depth

The system is flat. Depth comes from four tonal steps (ground, plate, plate-2, plate-3) and from hairlines; hover and open states lift a row one tonal step instead of casting shadow.

### Shadow Vocabulary
- **Popover drop** (`box-shadow: 0 18px 40px -12px rgba(0, 0, 0, 0.7)`): only the search results list, the one element that floats over content.
- **Focus halo** (`box-shadow: 0 0 0 3px var(--ground), 0 0 0 5px var(--bone)`): slider thumbs under keyboard focus; a cut-out ring, not a glow.

### Named Rules
**The Tonal Step Rule.** A surface that needs to sit above another moves one step up the plate ramp. Shadows are reserved for elements that physically float over content (popovers) and for focus rings.

## Shapes

Corners are near-square (2px, 1px on slider thumbs); only status dots are round. The recurring silhouette is the forward slant: the right edge of a tab or plate is cut back so the bottom runs shorter than the top. Section tabs cut 12px, the verdict lower-third 30px, the next-action strip 7px, score-level tags and chips cut both ends 3 to 4px into parallelograms. Bars inherit the same lean through skew: meter steps and split segments at -14deg, stat-strip dividers at -12deg, the matchup divider at -8deg. Section tabs sit flush to their plate's top-left corner by negative margin.

**The Forward Lean Rule.** Every slant leans the same way (top edge longer, cut on the right). Never mirror it and never cut the left edge.

## Components

### Buttons
Quiet and utilitarian; the page has no submit button because inputs re-score live.
- **Shape:** near-square (2px).
- **Quiet button:** muted text, 13.5px weight 550, 6px by 10px padding, optional 15px leading icon.
- **Hover / Focus:** fills to tab plate and paper text over 160ms; focus is the global 2px bone outline at 2px offset.
- **Pick card:** a full-width plate button with rank mark, Riot ID and rank/agent meta; hover lifts to tab plate.

### Chips
- **Style:** 11px condensed caps on a 16% tint of its status colour, text in the status text tint, parallelogram-cut ends.
- **State:** healthy, watch, off-track (risk) only.

### Score-Level Tag
Solid status fill with bone-ink text (white on red), 13px condensed caps at 0.08em, both ends cut 4px. Sits beside the score numeral.

### Cards / Containers
- **Corner Style:** 2px.
- **Background:** graphite plate; nested panels on raised plate.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none on plates; the player card carries a 3px top rule in the player's rank colour.
- **Internal Padding:** 22px by 24px.
- **Section tab:** the heading rides a tab-plate slanted tab flush to the plate's top-left, then a muted lede at 14.5px.

### Inputs / Fields
- **Search:** 44px tall plate field, 1px strong-hairline border, left search icon, right keyboard hint; hover brightens the border, focus turns it bone and lifts the fill to raised plate.
- **Slider:** a 4px track filled in muted text up to the value, a green-bordered healthy band behind it, and a 10px by 22px bone thumb with a ground border; hover widens the thumb, keyboard focus adds the cut-out halo. The value reads as a display numeral coloured by status.

### Navigation
A sticky top bar on a ground-adjacent fill with a hairline bottom: wordmark (display caps, "Coach" in bone, triangular mark with a red wedge), search, and a status dot with label (green online, amber degraded, red offline).

### Verdict Lower-Third (signature)
A bone plate with a 30px right-edge cut carrying a short verdict headline, one deck sentence, and three hairline-ruled data lines (Now, Driving it, With the plan), each set as lane label, display-type figures, and one plain sentence on a shared subgrid so the columns align. Status figures on bone use the bone inks (ok #0b7350, watch #8a5806, risk #b21f2c), never the graphite-side tints. A signal-red-deep strip follows, indented to start exactly where the plate's slant ends, holding an arrow and "Do this first." The plate and strip wipe in left to right on the ease-out curve and the data lines slide in after, 90ms apart. The verdict never carries a prose paragraph: numbers live in the lines, explanation in their one-line notes.

### Stepped Meter and Head-to-Head Lanes (signature)
Risk is read off 20 skewed steps lit in their band colour (green, amber, red at the model's thresholds), never a free gradient. Factor rows pair a "Healthy" lane (green) with a "You" lane (bone) and mark the gap in amber or red, with outlined gaps when the user falls short. Diverging bars grow from a centre axis: red pushes toward risk, green protects.

## Do's and Don'ts

### Do:
- **Do** separate surfaces by stepping ground, plate, plate-2, plate-3 and by 1px hairlines.
- **Do** cut tabs, tags and lower-thirds with the forward slant and skew bars at -12 to -14deg.
- **Do** set announced numbers and headings in Big Shoulders Display caps with tabular figures.
- **Do** keep red, green and amber strictly semantic, and use their `-text` tints for type on graphite.
- **Do** animate with wipes and grows on cubic-bezier(0.16, 1, 0.3, 1), and honour reduced motion.
- **Do** draw any data graphic only from model or input values.

### Don't:
- **Don't** add glows, glassy blur, or decorative gradients; hard-stop fills and the sidebar's scroll-fade mask are utility, not ornament.
- **Don't** cast shadows on plates; only popovers and focus halos get one.
- **Don't** introduce a second light plate alongside the bone verdict.
- **Don't** round corners beyond 2px except status dots.
- **Don't** build generic equal stat-tile grids; numbers belong in strips, lanes and head-to-head boards.
