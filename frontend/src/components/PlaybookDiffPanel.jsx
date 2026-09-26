// Real data from generations.csv (01_architecture.png: "Blue coach rewrites
// the defense playbook between games"). Not every generation is kept --
// `kept: false` means this experiment made things worse and was rolled
// back, which is worth showing rather than hiding (it's the honest version
// of "the AI sometimes tries something that doesn't work").
export function PlaybookDiffPanel({ playbook }) {
  if (!playbook) return <div className="panel diff"><h3>Playbook</h3></div>;

  const { version, parentVersion, diffSummary, winRate, parentWinRate, kept, evalLevel, evalGames, levelUnlocked } = playbook;
  const arrow = "→";
  const dot = "·";
  const cross = "✗";

  const title = parentVersion !== null
    ? `Playbook v${parentVersion} ${arrow} v${version}${kept === false ? " (reverted)" : ""}`
    : `Playbook v${version}`;

  const winRateLine = `eval level ${evalLevel} ${dot} ${evalGames} games ${dot} win rate ${parentWinRate !== null ? `${parentWinRate}% ${arrow} ` : ""}${winRate}%${levelUnlocked ? ` ${dot} unlocked level ${levelUnlocked}!` : ""}`;

  return (
    <div className="panel diff">
      <h3>{title}</h3>
      <div className={kept === false ? "del" : "add"}>{kept === false ? cross : "+"} {diffSummary}</div>
      <div className="diff-note">{winRateLine}</div>
    </div>
  );
}
