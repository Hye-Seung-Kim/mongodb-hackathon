// Redesign palette per the x.ai/voice-inspired dark mode spec: deep
// slate/charcoal backgrounds, neon red vs electric blue accents.
export const COLORS = {
  bg: "#0B0F19",
  panel: "#111827",
  panelDeep: "#0B0F19",
  line: "#1F2937",
  text: "#E6ECF5",
  muted: "#8A98B3",
  blue: "#3B82F6",
  red: "#FF4D4D",
  amber: "#FFB547",
  gray: "#5B6780",
  green: "#3DDC97",
  gold: "#FFD166",
  white: "#FFFFFF",
};

// Real recorded node_states use "blue/amber/red/gray" directly (see
// NODE_STATE_TO_STATUS in data/network.js) -- these are the same four
// concepts as before, just relabeled for the intrusion scenario: a node is
// either safe, under active suspicion/attack, fully taken by Red, or
// offline (isolated by Blue, or simply not provisioned yet).
export const STATUS_COLORS = {
  safe: COLORS.blue,
  attacked: COLORS.amber,
  taken: COLORS.red,
  offline: COLORS.gray,
};

export const STATUS_LABELS = {
  safe: "Safe",
  attacked: "Under attack",
  taken: "Taken by Red",
  offline: "Offline / isolated",
};

export const SIDE_COLORS = {
  RED: COLORS.red,
  BLUE: COLORS.blue,
};
