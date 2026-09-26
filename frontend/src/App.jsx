import { useState } from "react";
import { useGameEngine } from "./hooks/useGameEngine";
import { TopBar } from "./components/TopBar";
import { NetworkScene } from "./components/NetworkScene";
import { LogPanel } from "./components/LogPanel";
import { BottomControls } from "./components/BottomControls";
import { ResultBanner } from "./components/ResultBanner";
import "./App.css";

// Frontend skeleton for the Red vs Blue brief: left two-thirds is the live
// network map (now 3D orbs instead of flat circles), right third is the
// play-by-play log, top bar shows game/turn/win-rate, bottom bar drives
// play/pause/step/speed. `useGameEngine` currently runs a scripted mock
// simulation (see engine/simulateGame.js) standing in for the real
// backend -- swap that hook's internals for live game data and nothing
// else here should need to change.
function App() {
  const { state, isPlaying, speed, play, pause, step, setSpeed } = useGameEngine();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  return (
    <div className="app-shell">
      <TopBar state={state} />
      <div className="main-panels">
        <NetworkScene state={state} hoveredNodeId={hoveredNodeId} onHoverNode={setHoveredNodeId} />
        <LogPanel log={state.log} hoveredNodeId={hoveredNodeId} onHoverNode={setHoveredNodeId} />
      </div>
      <BottomControls isPlaying={isPlaying} speed={speed} onPlay={play} onPause={pause} onStep={step} onSpeedChange={setSpeed} />
      <ResultBanner result={state.result} reason={state.resultReason} />
    </div>
  );
}

export default App;
