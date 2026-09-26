// "Show learning. A small chart of Blue's win rate climbing over thousands
// of games. This is the 'wow' moment." -- matches 03_ui_mockup.html's
// bottom-middle panel (800x120 viewBox, axis line, end-point dot + label).
const WIDTH = 800;
const HEIGHT = 120;
const AXIS_Y = 110;

export function WinRateSparkline({ history, gameNumber }) {
  if (history.length < 2) {
    return <div className="panel"><h3>Blue win rate -- the "wow"</h3><p className="muted">Chart appears after game 1...</p></div>;
  }

  const max = 100;
  const stepX = WIDTH / (history.length - 1);
  const toY = (value) => AXIS_Y - (value / max) * (AXIS_Y - 10);
  const points = history.map((value, i) => `${(i * stepX).toFixed(1)},${toY(value).toFixed(1)}`).join(" ");
  const last = history.at(-1);
  const lastX = (history.length - 1) * stepX;

  return (
    <div className="panel">
      <h3>Blue win rate over {gameNumber.toLocaleString()} games -- the "wow"</h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT}>
        <line x1="0" y1={AXIS_Y} x2={WIDTH} y2={AXIS_Y} stroke="var(--line)" />
        <polyline points={points} fill="none" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={toY(last)} r="6" fill="var(--blue)" />
        <text x={Math.max(0, lastX - 70)} y={toY(last) - 12} fill="var(--txt)" fontSize="14" fontWeight="700">{Math.round(last)}%</text>
        <text x="4" y={toY(history[0]) - 6} fill="var(--mut)" fontSize="13">{Math.round(history[0])}%</text>
      </svg>
    </div>
  );
}
