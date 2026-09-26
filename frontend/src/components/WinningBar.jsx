// Top bar's blue/red split bar -- distinct from the bottom panel's win-rate
// *history* chart. This one just shows this instant's estimated split.
export function WinningBar({ bluePct }) {
  const blue = Math.max(0, Math.min(100, bluePct));
  return (
    <div className="winning-bar-wrap">
      <div className="k">Who's winning -- Blue {blue}%</div>
      <div className="winning-bar">
        <div className="winning-bar-fill" style={{ width: `${blue}%` }} />
      </div>
    </div>
  );
}
