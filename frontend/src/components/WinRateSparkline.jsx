// Brief: "Show learning. A small chart of Blue's win rate climbing over
// thousands of games. This is the 'wow' moment." Hand-rolled inline SVG --
// not worth a charting dependency for one sparkline.
const WIDTH = 160;
const HEIGHT = 32;

export function WinRateSparkline({ history }) {
  if (history.length < 2) {
    return <div className="sparkline sparkline-empty">Learning curve appears after game 1...</div>;
  }

  const max = 100;
  const min = 0;
  const stepX = WIDTH / (history.length - 1);
  const points = history
    .map((value, i) => {
      const x = i * stepX;
      const y = HEIGHT - ((value - min) / (max - min)) * HEIGHT;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
