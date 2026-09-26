import { useState } from "react";
import { useGameReplay } from "./hooks/useGameReplay";
import { TopBar } from "./components/TopBar";
import { NetworkScene } from "./components/NetworkScene";
import { LogPanel } from "./components/LogPanel";
import { BottomControls } from "./components/BottomControls";
import { WinRateSparkline } from "./components/WinRateSparkline";
import { PlaybookDiffPanel } from "./components/PlaybookDiffPanel";
import { ResultBanner } from "./components/ResultBanner";
import "./App.css";

// Rebuilt to replay *real* recorded games (public/data/*.csv, exported from
// the backend's MongoDB collections) instead of a scripted simulation --
// see src/hooks/useGameReplay.js for how a "turn" is just revealing the next
// pre-recorded event. Layout unchanged: top stat bar, middle row (network
// map 2/3 | log 1/3), bottom row (controls | win-rate history | playbook).
function App() {
  const { state, playbook, loading, isPlaying, speed, play, pause, step, setSpeed } = useGameReplay();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="panel" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
          Loading real game data...
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar state={state} playbookVersion={playbook?.version} />
      <div className="mid">
        <NetworkScene state={state} hoveredNodeId={hoveredNodeId} onHoverNode={setHoveredNodeId} />
        <LogPanel log={state.log} hoveredNodeId={hoveredNodeId} onHoverNode={setHoveredNodeId} />
      </div>
      <div className="bot">
        <BottomControls isPlaying={isPlaying} speed={speed} onPlay={play} onPause={pause} onStep={step} onSpeedChange={setSpeed} />
        <WinRateSparkline history={state.blueWinRateHistory} gameNumber={state.gameNumber} />
        <PlaybookDiffPanel playbook={playbook} />
      </div>
      <ResultBanner result={state.result} reason={state.resultReason} />
    </div>
  );
}

export default App;
