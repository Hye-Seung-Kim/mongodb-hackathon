const SPEEDS = [1, 10, 100];

export function BottomControls({ isPlaying, speed, onPlay, onPause, onStep, onSpeedChange }) {
  return (
    <div className="panel">
      <h3>Controls</h3>
      <button type="button" className={`btn${isPlaying ? " on" : ""}`} onClick={onPlay}>{"▶ Play"}</button>
      <button type="button" className={`btn${!isPlaying ? " on" : ""}`} onClick={onPause}>{"⏸"}</button>
      <button type="button" className="btn" onClick={onStep}>{"⏭ Step"}</button>
      <br />
      {SPEEDS.map((s) => (
        <button key={s} type="button" className={`btn${speed === s ? " on" : ""}`} onClick={() => onSpeedChange(s)}>
          {s}x
        </button>
      ))}
    </div>
  );
}
