import Papa from "papaparse";

// Real sample data exported from the backend's MongoDB collections (see
// 01_architecture.png: games / turns(events) / playbooks(generations) /
// attack_patterns(scenarios), plus a `lessons` collection). Served as static
// CSVs under public/data/ and parsed client-side -- there's no live backend
// yet, so this is the closest thing to "real" the frontend can run against.
const FILES = ["scenarios", "lessons", "generations", "games", "events"];

function parseCsv(text) {
  const { data } = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  return data;
}

const TRUE_STRINGS = new Set(["true", "1", "yes"]);
function toBool(value) {
  if (value === undefined || value === null || value === "") return null;
  return TRUE_STRINGS.has(String(value).toLowerCase());
}

function toNum(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function coerceEvent(row) {
  return {
    ...row,
    turn: toNum(row.turn),
    success: toBool(row.success),
    detected: toBool(row.detected),
    guardrail_blocked: row.guardrail_blocked || null,
    recalled_lessons: row.recalled_lessons ? row.recalled_lessons.split(";").filter(Boolean) : [],
    node_states: row.node_states ? JSON.parse(row.node_states) : null,
  };
}

function coerceGame(row) {
  return {
    ...row,
    level: toNum(row.level),
    harness_version: toNum(row.harness_version),
    memory_enabled: toBool(row.memory_enabled),
    turns: toNum(row.turns),
    time_to_detect: toNum(row.time_to_detect),
    time_to_evict: toNum(row.time_to_evict),
    max_nodes_red: toNum(row.max_nodes_red),
    false_alarms: toNum(row.false_alarms),
    collateral_nodes: toNum(row.collateral_nodes),
    lessons_written: toNum(row.lessons_written),
    tokens_in: toNum(row.tokens_in),
    tokens_out: toNum(row.tokens_out),
  };
}

function coerceGeneration(row) {
  return {
    ...row,
    version: toNum(row.version),
    parent: row.parent === "" ? null : toNum(row.parent),
    eval_level: toNum(row.eval_level),
    eval_games: toNum(row.eval_games),
    win_rate: toNum(row.win_rate),
    parent_win_rate: toNum(row.parent_win_rate),
    kept: toBool(row.kept),
    level_unlocked: row.level_unlocked === "" ? null : toNum(row.level_unlocked),
  };
}

let cached = null;

// Fetched once (module-level cache) since this is static data for the
// lifetime of the tab -- every consumer of useGameReplay shares one load.
export async function loadGameData() {
  if (cached) return cached;

  const texts = await Promise.all(FILES.map((name) => fetch(`/data/${name}.csv`).then((r) => r.text())));
  const [scenarios, lessons, generationsRaw, gamesRaw, eventsRaw] = texts.map(parseCsv);

  const games = gamesRaw.map(coerceGame);
  const generations = generationsRaw.map(coerceGeneration).sort((a, b) => a.version - b.version);
  const events = eventsRaw.map(coerceEvent).sort((a, b) => a.turn - b.turn || (a.side === "red" ? -1 : 1));

  const eventsByGame = {};
  events.forEach((e) => {
    (eventsByGame[e.game_id] ??= []).push(e);
  });

  // Only games with a full turn-by-turn recording can actually be replayed
  // move-by-move; others (in `games` but not `eventsByGame`) only have a
  // final summary row. As more games get their events exported this list
  // grows on its own -- nothing else needs to change.
  const replayableGameIds = games.map((g) => g.game_id).filter((id) => eventsByGame[id]?.length);

  cached = { scenarios, lessons, generations, games, events, eventsByGame, replayableGameIds };
  return cached;
}
