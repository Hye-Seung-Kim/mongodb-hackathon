// Placeholder game engine -- a scripted, randomized stand-in for the real
// Red/Blue self-play backend (MongoDB-backed RL agents). It exists so the
// frontend has something to render and animate right now; swap `advanceTurn`
// for real per-turn events from the backend (websocket/poll) and this file
// goes away, but the shape of a "turn" (one RED entry + one BLUE entry, plus
// any node/edge state changes) should stay the contract the UI expects.

import { ATTACKS, DEFENSES, EDGES, NODES } from "../data/network";

export const MAX_TURNS = 20;
const REAL_DEVICE_IDS = NODES.filter((n) => n.id !== "internet").map((n) => n.id);
const ENTRY_POINTS = ["laptopA", "laptopB"];

function edgeKey(a, b) {
  return [a, b].sort().join("|");
}

function neighborsOf(nodeId) {
  return EDGES.filter((e) => e.includes(nodeId)).map((e) => (e[0] === nodeId ? e[1] : e[0]));
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function nodeName(id) {
  return NODES.find((n) => n.id === id)?.name ?? id;
}

let nextEffectId = 1;
let nextLogId = 1;

export function createInitialState(gameNumber, blueWinRateHistory = []) {
  const nodeStatus = {};
  NODES.forEach((n) => {
    nodeStatus[n.id] = "safe";
  });
  return {
    gameNumber,
    turn: 1,
    maxTurns: MAX_TURNS,
    nodeStatus,
    hiddenRed: {},
    patchedNodes: new Set(),
    blockedEdges: new Set(),
    redEverHadFoothold: false,
    log: [],
    effects: [],
    result: null,
    resultReason: "",
    blueWinRateHistory,
  };
}

function redHeldNodes(state) {
  return REAL_DEVICE_IDS.filter((id) => state.nodeStatus[id] === "taken");
}

function pushLog(state, side, text, nodeId) {
  state.log = [{ id: nextLogId++, turn: state.turn, side, text, nodeId }, ...state.log].slice(0, 200);
}

function pushEffect(state, effect) {
  state.effects = [...state.effects, { id: nextEffectId++, createdAt: Date.now(), ...effect }];
}

function applyRedTurn(state) {
  const held = redHeldNodes(state);

  if (held.length === 0) {
    const target = pick(ENTRY_POINTS.filter((id) => state.nodeStatus[id] === "safe") || ENTRY_POINTS);
    const attackType = pick(["phishing", "password_guessing"]);
    const success = Math.random() < 0.75;
    const baseText = ATTACKS[attackType](nodeName(target));
    if (success) {
      state.nodeStatus[target] = "taken";
      state.hiddenRed[target] = true;
      state.redEverHadFoothold = true;
      pushLog(state, "RED", `${baseText} -- Red is in`, target);
    } else {
      pushLog(state, "RED", `${baseText} -- no luck`, target);
    }
    return;
  }

  const candidates = [];
  held.forEach((from) => {
    neighborsOf(from).forEach((to) => {
      if (!held.includes(to) && state.nodeStatus[to] !== "offline" && !state.blockedEdges.has(edgeKey(from, to))) {
        candidates.push({ from, to });
      }
    });
  });

  if (candidates.length === 0) {
    pushLog(state, "RED", "Boxed in -- probing for another way forward");
    return;
  }

  const { from, to } = pick(candidates);
  const isCrownJewel = to === "database";
  const attackType = isCrownJewel ? "steal_data" : pick(["exploit_old_software", "steal_passwords", "move_sideways"]);
  const isPatchedExploit = attackType === "exploit_old_software" && state.patchedNodes.has(to);
  const success = Math.random() < (isPatchedExploit ? 0.2 : 0.65);
  const actionText = attackType === "move_sideways" ? ATTACKS.move_sideways(nodeName(from), nodeName(to)) : ATTACKS[attackType](nodeName(to));

  if (!success) {
    if (state.nodeStatus[to] === "safe") state.nodeStatus[to] = "attacked";
    pushLog(state, "RED", `${actionText} -- blocked${isPatchedExploit ? " (already patched)" : ""}`, to);
    return;
  }

  state.nodeStatus[to] = "taken";
  state.hiddenRed[to] = true;
  pushEffect(state, { kind: "pulse", from, to });

  if (isCrownJewel) {
    pushLog(state, "RED", `${actionText} Crown jewel captured.`, to);
    state.result = "red_win";
    state.resultReason = "Red captured the crown jewel.";
    return;
  }

  pushLog(state, "RED", actionText, to);

  const takenCount = redHeldNodes(state).length;
  if (takenCount >= Math.ceil(REAL_DEVICE_IDS.length / 2)) {
    state.result = "red_win";
    state.resultReason = "Red took over half the network.";
  }
}

function applyBlueTurn(state) {
  if (state.result) return; // Red already won this turn -- no Blue reply.

  const held = redHeldNodes(state);
  const visible = held.filter((id) => !state.hiddenRed[id]);
  const hidden = held.filter((id) => state.hiddenRed[id]);

  if (visible.length > 0 && Math.random() < 0.6) {
    const target = pick(visible);
    if (Math.random() < 0.5) {
      state.nodeStatus[target] = "offline";
      pushLog(state, "BLUE", DEFENSES.isolate_node(nodeName(target)), target);
    } else {
      state.nodeStatus[target] = "safe";
      delete state.hiddenRed[target];
      pushLog(state, "BLUE", DEFENSES.restore_from_backup(nodeName(target)), target);
    }
    pushEffect(state, { kind: "flash", nodeId: target });
  } else if (hidden.length > 0 && Math.random() < 0.5) {
    const target = pick(hidden);
    state.hiddenRed[target] = false;
    pushLog(state, "BLUE", `${DEFENSES.scan(nodeName(target))}: intruder found!`, target);
    pushEffect(state, { kind: "flash", nodeId: target });
  } else {
    const action = pick(["scan", "patch", "reset_passwords", "firewall_rule"]);
    if (action === "scan") {
      const target = pick(REAL_DEVICE_IDS.filter((id) => state.nodeStatus[id] !== "offline"));
      pushLog(state, "BLUE", `${DEFENSES.scan(nodeName(target))}: all clear`, target);
    } else if (action === "patch") {
      const safeNodes = REAL_DEVICE_IDS.filter((id) => state.nodeStatus[id] === "safe" && !state.patchedNodes.has(id));
      if (safeNodes.length > 0) {
        const target = pick(safeNodes);
        state.patchedNodes.add(target);
        pushLog(state, "BLUE", DEFENSES.patch(nodeName(target)), target);
        pushEffect(state, { kind: "flash", nodeId: target });
      } else {
        pushLog(state, "BLUE", "Reviewed patch levels: everything current");
      }
    } else if (action === "reset_passwords") {
      const target = pick(REAL_DEVICE_IDS.filter((id) => state.nodeStatus[id] !== "offline"));
      pushLog(state, "BLUE", DEFENSES.reset_passwords(nodeName(target)), target);
      pushEffect(state, { kind: "flash", nodeId: target });
    } else {
      const openEdges = EDGES.filter(([a, b]) => !state.blockedEdges.has(edgeKey(a, b)));
      if (openEdges.length > 0) {
        const [a, b] = pick(openEdges);
        state.blockedEdges.add(edgeKey(a, b));
        pushLog(state, "BLUE", DEFENSES.firewall_rule(nodeName(a), nodeName(b)));
      } else {
        pushLog(state, "BLUE", "Reviewed firewall rules");
      }
    }
  }

  if (state.redEverHadFoothold && redHeldNodes(state).length === 0) {
    state.result = "blue_win";
    state.resultReason = "Blue kicked Red out of every node.";
  } else if (state.turn >= state.maxTurns) {
    state.result = "blue_win";
    state.resultReason = "Blue survived all 20 turns.";
  }
}

// Prunes finished animation effects (see NetworkScene/AttackPulse/ShieldFlash
// for the matching duration) so the array doesn't grow forever.
const EFFECT_LIFETIME_MS = 1000;
function pruneEffects(state) {
  const now = Date.now();
  state.effects = state.effects.filter((e) => now - e.createdAt < EFFECT_LIFETIME_MS);
}

// One immutable-ish step: mutates a shallow clone of `state` and returns it.
// (Cloning deeply for a mock engine isn't worth it -- Sets/objects are
// reassigned wholesale wherever they change.)
export function advanceTurn(prevState) {
  if (prevState.result) return prevState;

  const state = {
    ...prevState,
    nodeStatus: { ...prevState.nodeStatus },
    hiddenRed: { ...prevState.hiddenRed },
    patchedNodes: new Set(prevState.patchedNodes),
    blockedEdges: new Set(prevState.blockedEdges),
  };

  pruneEffects(state);
  applyRedTurn(state);
  applyBlueTurn(state);
  if (!state.result) state.turn += 1;

  return state;
}
