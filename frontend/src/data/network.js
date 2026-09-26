// Static topology from the design brief's example map. Swap this for
// whatever the real backend sends per-game once it exists -- everything
// downstream (engine, 3D scene, log) only cares about the shape
// { id, name, type, crownJewel } / [idA, idB] pairs, not where it came from.

export const NODES = [
  { id: "internet", name: "Internet", type: "gateway" },
  { id: "router", name: "Router", type: "router" },
  { id: "laptopA", name: "Laptop A", type: "laptop" },
  { id: "laptopB", name: "Laptop B", type: "laptop" },
  { id: "server", name: "Server", type: "server" },
  { id: "printer", name: "Printer", type: "printer" },
  { id: "database", name: "Database", type: "database", crownJewel: true },
];

export const EDGES = [
  ["internet", "router"],
  ["router", "laptopA"],
  ["router", "laptopB"],
  ["laptopA", "server"],
  ["laptopB", "printer"],
  ["server", "database"],
  ["printer", "database"],
];

// Hand-placed hex-ish layout in 3D space (X/Z ground plane, Y for a little
// vertical variety) so the graph reads clearly from the default camera
// angle. The crown jewel sits highest -- literally the thing worth defending.
export const NODE_POSITIONS = {
  internet: [-4.2, 0, 0],
  router: [-2.2, 0, 0],
  laptopA: [-0.4, 0.4, -1.6],
  laptopB: [-0.4, -0.4, 1.6],
  server: [1.8, 0.6, -1.8],
  printer: [1.8, -0.6, 1.8],
  database: [4, 1.2, 0],
};

export const ATTACKS = {
  phishing: (node) => `Sent a phishing email to ${node} -- waiting to see if someone clicks`,
  password_guessing: (node) => `Tried common passwords against ${node}`,
  exploit_old_software: (node) => `Exploited an unpatched flaw on ${node}`,
  steal_passwords: (node) => `Stole saved logins from ${node}`,
  move_sideways: (from, to) => `Hopped from ${from} to ${to} using stolen access`,
  steal_data: (node) => `Copying files off ${node}...`,
};

export const DEFENSES = {
  scan: (node) => `Scanned ${node} for signs of intrusion`,
  patch: (node) => `Patched ${node} (took a full turn)`,
  reset_passwords: (node) => `Reset passwords on ${node}`,
  firewall_rule: (from, to) => `Added a firewall rule blocking ${from} <-> ${to}`,
  isolate_node: (node) => `Isolated ${node} -- unplugged, but safe`,
  restore_from_backup: (node) => `Restored ${node} from backup`,
};
