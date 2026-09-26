const SPEEDS = [1, 10, 100];

export function BottomControls({ isPlaying, speed, onPlay, onPause, onStep, onSpeedChange }) {
  return (
    <div className="bottom-controls">
      <div className="bottom-controls-buttons">
        <button type="button" className="control-button" onClick={isPlaying ? onPause : onPlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" className="control-button" onClick={onStep} disabled={isPlaying}>
          Step
        </button>
      </div>
      <div className="bottom-controls-speed">
        <span>Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            className={`speed-button${speed === s ? " speed-button-active" : ""}`}
            onClick={() => onSpeedChange(s)}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
