export function ResultBanner({ result, reason }) {
  if (!result) return null;
  const isBlue = result === "blue_win";
  return (
    <div className={`result-banner ${isBlue ? "result-banner-blue" : "result-banner-red"}`}>
      <div className="result-banner-title">{isBlue ? "BLUE WINS" : "RED WINS"}</div>
      <div className="result-banner-reason">{reason}</div>
      <div className="result-banner-next">Next game starting...</div>
    </div>
  );
}
