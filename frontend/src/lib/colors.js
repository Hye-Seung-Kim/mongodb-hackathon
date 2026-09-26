// Brief's design wishlist, verbatim: "Color = ownership. Blue safe, amber
// under attack, red taken, gray offline. Readable at a glance." Every visual
// (3D orbs, log tags, legend) reads from this single source.
export const STATUS_COLORS = {
  safe: "#3b82f6",
  attacked: "#f59e0b",
  taken: "#ef4444",
  offline: "#6b7280",
};

export const STATUS_LABELS = {
  safe: "Safe",
  attacked: "Under attack",
  taken: "Taken by Red",
  offline: "Offline",
};

export const SIDE_COLORS = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
};
