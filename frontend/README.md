# Red vs. Blue -- Frontend

Visualization for an AI Red-team-vs-Blue-team self-play cyber-defense game
(MITRE ATT&CK-flavored intrusion scenario: phishing -> credential theft ->
lateral movement -> crown jewel). Left two-thirds: a live network map with a
glowing WebGL sphere background. Right third: a real-time play-by-play log.
Top bar: game/level/turn stats. Bottom bar: play/pause/step/speed, win-rate
history, and the evolving defense playbook.

## This replays *real* recorded games -- there is no mock engine

Earlier iterations of this frontend used a scripted random simulation to have
something to render before real data existed. That's gone now:
`src/hooks/useGameReplay.js` loads real exported data
(`public/data/*.csv` -- games, events, generations, lessons, scenarios,
mirroring the backend's MongoDB collections per `01_architecture.png`) and
"plays" it back one recorded event at a time. Play/Pause/Step/Speed control
the *pace of revealing* pre-recorded events, not a live simulation.

Only `g_0042` currently has a full per-turn event recording in `events.csv`
(the other games in `games.csv` are summary-only), so the replay loops that
one game -- `useGameReplay`'s `replayableGameIds` list picks up any other
game automatically once the backend exports its events too, no code changes
needed.

State shape every component reads from:

```js
{
  gameId, gameNumber, level, turn, maxTurns,
  nodeStatus: { [nodeId]: "safe" | "attacked" | "taken" | "offline" },
  log: [{ id, turn, side: "RED" | "BLUE", action, text, nodeId, detail }],  // newest first
  lastAttackTarget, lastBlueTarget,
  nextRedPreview: { text, target } | null,  // peeked from the real upcoming event
  result: null | "red_win" | "blue_win",
  resultReason,
  blueWinRateHistory: number[],  // from generations.csv's win_rate column
}
```

## Topology

`internet -> router -> {laptopA, laptopB} -> {server, printer} -> database`
(the crown jewel), matching the `node_states` keys in `events.csv` exactly.
This is a different (and now the *real*) scenario from an earlier DDoS-themed
exploration (CDN/load-balancer/web-servers) that never got real backend data
-- see `docs/` for that earlier direction if it's ever revived.

## Visual design

Redesigned to an x.ai/voice-inspired dark aesthetic:

- **WebGL sphere background** (`src/three/VoiceSphereScene.jsx`): a custom
  GLSL shader (hand-written trig-based pseudo-noise displacement + Fresnel
  rim lighting blending red/blue), plus a dim wireframe shell for the
  "network grid" look. Deliberately *not* a textbook simplex-noise snippet --
  this dev environment has no browser to visually verify shader output in,
  so a shader simple enough to read with confidence beat a more "authentic"
  one that might silently render black if mistyped from memory. Sits behind
  the 2D SVG node graph, which stays 2D/data-driven for reliability.
- **Glassmorphic nodes**: translucent fill + soft outer glow + bright ring,
  colored by status (`src/lib/colors.js`).
- **Redesigned log feed**: translucent rounded cards (`rgba(255,255,255,0.03)`),
  a colored left-border accent instead of boxed tags, a muted sub-detail line
  (the real data's `reason` / `guardrail_blocked` / `outcome`), hover glow.
- Palette: deep slate/charcoal (`#0B0F19`, `#111827`), neon red (`#FF4D4D`)
  vs electric blue (`#3B82F6`).

## Run locally

```bash
npm install
npm run dev
```

## Not done yet / known gaps

- Only one game (`g_0042`) has full event-level detail to replay; the demo
  loops it. More variety needs more games exported to `events.csv`.
- The WebGL sphere hasn't been visually verified in a real browser (no
  browser available in this dev environment) -- built and lint/build-checked
  only. Please eyeball it.
- `scenarios.csv` (the full attack-technique catalog per difficulty level)
  and `lessons.csv` are loaded but not yet surfaced anywhere in the UI --
  natural next additions (e.g. a tooltip on hover showing the MITRE
  technique, or a dedicated lessons feed).
- No automated tests.
