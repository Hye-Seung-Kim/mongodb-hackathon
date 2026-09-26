import { WinningBar } from "./WinningBar";

export function TopBar({ state, playbookVersion }) {
  const latestWinRate = state.blueWinRateHistory.at(-1) ?? 50;
  const redHeldCount = Object.values(state.nodeStatus).filter((s) => s === "taken").length;

  return (
    <div className="top-bar">
      <div className="top-bar-brand">
        <span>{"\u{1F6E1}️"}</span> RED vs BLUE
      </div>
      <Stat label="Game" value={`#${state.gameNumber}`} />
      <Stat label="Level" value={state.level ?? "--"} />
      <Stat label="Turn" value={`${state.turn} / ${state.maxTurns || "?"}`} />
      <Stat label="Red holds" value={`${redHeldCount} node${redHeldCount === 1 ? "" : "s"}`} color={redHeldCount > 0 ? "var(--red)" : undefined} />
      {playbookVersion !== undefined && <Stat label="Playbook" value={`v${playbookVersion}`} />}
      <div className="top-bar-spacer" />
      <WinningBar bluePct={Math.round(latestWinRate)} />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="stat">
      <div className="k">{label}</div>
      <div className="v" style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}
