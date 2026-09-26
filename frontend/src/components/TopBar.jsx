import { WinRateSparkline } from "./WinRateSparkline";

export function TopBar({ state }) {
  const redOwnedCount = Object.entries(state.nodeStatus).filter(([, status]) => status === "taken").length;
  const latestWinRate = state.blueWinRateHistory.at(-1);

  return (
    <div className="top-bar">
      <div className="top-bar-stats">
        <span>Game #{state.gameNumber.toLocaleString()}</span>
        <span className="top-bar-sep">|</span>
        <span>Turn {state.turn} / {state.maxTurns}</span>
        <span className="top-bar-sep">|</span>
        <span>Red owns {redOwnedCount} node{redOwnedCount === 1 ? "" : "s"}</span>
        <span className="top-bar-sep">|</span>
        <span>Blue win rate: {latestWinRate !== undefined ? `${latestWinRate.toFixed(0)}%` : "--"}</span>
      </div>
      <WinRateSparkline history={state.blueWinRateHistory} />
    </div>
  );
}
