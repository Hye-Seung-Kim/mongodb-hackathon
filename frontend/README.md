# Red vs. Blue -- Frontend

Frontend skeleton for the "Red vs. Blue" cyber-defense visualization, built
from `red_vs_blue_design_brief.pdf`. Left two-thirds: a live 3D network map.
Right third: a red/blue play-by-play log. Top bar: game/turn/win-rate. Bottom
bar: play/pause/step/speed.

## What's real vs. mocked

There is no backend yet. `src/hooks/useGameEngine.js` currently drives the UI
with `src/engine/simulateGame.js`, a scripted random simulation of a
Red-vs-Blue game (see comments there) -- enough to see and animate the whole
UI end-to-end before the real self-play backend (the RL agents + MongoDB)
exists. Swap the *inside* of `useGameEngine` for real per-turn events (poll or
websocket) and nothing else should need to change -- every component reads
from the same state shape:

```js
{
  gameNumber, turn, maxTurns,
  nodeStatus: { [nodeId]: "safe" | "attacked" | "taken" | "offline" },
  hiddenRed: { [nodeId]: boolean },       // Red-held but not yet detected by Blue
  blockedEdges: Set<"idA|idB">,          // firewall rules
  log: [{ id, turn, side: "RED" | "BLUE", text, nodeId }],  // newest first
  effects: [{ id, kind: "pulse", from, to } | { id, kind: "flash", nodeId }],
  result: null | "red_win" | "blue_win",
  resultReason: string,
  blueWinRateHistory: number[],          // one entry per finished game
}
```

## Design brief -> implementation

- **3D instead of flat circles** (requested change from the brief's 2D dot
  map): `src/three/NodeOrb.jsx` -- glowing, softly-distorted orbs
  (`@react-three/drei`'s `MeshDistortMaterial` + bloom postprocessing) in the
  spirit of x.ai/voice's orb aesthetic. Couldn't load that page directly in
  this environment (blocked/no browser) to match it exactly -- worth a
  side-by-side check.
- **Color = ownership**: `src/lib/colors.js` is the single source for
  safe/attacked/taken/offline colors, used by the 3D orbs, the log tags, and
  the legend.
- **Show movement**: `src/three/AttackPulse.jsx` (a glowing sphere traveling
  node-to-node when Red hops) and `src/three/ShieldFlash.jsx` (an expanding
  ring when Blue acts on a node).
- **Hidden vs. seen**: a Red-held node Blue hasn't scanned yet renders faint
  (`hiddenRed` in engine state) until a scan reveals it.
- **Log and map linked**: `hoveredNodeId` is lifted to `App.jsx` and shared by
  both `LogPanel` (sets it on row hover) and `NodeOrb` (sets it via
  `onPointerOver`) -- hovering either highlights the other.
- **Show learning**: `src/components/WinRateSparkline.jsx`, a small inline-SVG
  chart of `blueWinRateHistory`.
- **Speed control**: 1x/10x/100x scales how fast `useGameEngine` auto-advances
  turns while playing.

## Run locally

```bash
npm install
npm run dev
```

## Not done yet / known gaps

- No backend connection -- see "What's real vs. mocked" above.
- x.ai/voice reference wasn't actually viewed (fetch blocked, no browser in
  the dev environment) -- the orb look is a best-effort match from general
  knowledge of that page, not a side-by-side comparison.
- Bundle isn't code-split (three.js + drei + postprocessing are the whole
  point of this page, so that's likely fine, but worth revisiting if load
  time matters for a demo).
- No automated tests.
