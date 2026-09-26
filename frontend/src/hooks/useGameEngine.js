import { useEffect, useRef, useState } from "react";
import { advanceTurn, createInitialState } from "../engine/simulateGame";

const BASE_INTERVAL_MS = 900; // roughly one turn/second at 1x
const NEXT_GAME_DELAY_MS = 1600;
const WIN_RATE_HISTORY_LIMIT = 60; // enough for a readable sparkline

export function useGameEngine() {
  const [state, setState] = useState(() => createInitialState(1));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const nextGameTimerRef = useRef(null);

  const step = () => setState((prev) => advanceTurn(prev));

  // Auto-advance while playing, at a rate scaled by speed (1x/10x/100x).
  useEffect(() => {
    if (!isPlaying || state.result) return undefined;
    const interval = Math.max(8, BASE_INTERVAL_MS / speed);
    const id = setInterval(step, interval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, state.result]);

  // "Then a new game starts, and both sides are a bit smarter" -- record a
  // win-rate data point and start over after a short pause so the result is
  // readable first.
  useEffect(() => {
    if (!state.result) return undefined;
    nextGameTimerRef.current = setTimeout(() => {
      setState((prev) => {
        const won = prev.result === "blue_win" ? 1 : 0;
        const priorRate = prev.blueWinRateHistory.at(-1) ?? 50;
        // Nudge the mock win rate toward "learning" (up on a win, down a
        // little on a loss) instead of pure noise -- replace with the
        // backend's real win-rate series once it exists.
        const nextRate = Math.min(99, Math.max(1, priorRate + (won ? 1 : -2) + (Math.random() * 2 - 1)));
        const history = [...prev.blueWinRateHistory, nextRate].slice(-WIN_RATE_HISTORY_LIMIT);
        return createInitialState(prev.gameNumber + 1, history);
      });
    }, NEXT_GAME_DELAY_MS / Math.max(1, Math.min(speed, 10)));
    return () => clearTimeout(nextGameTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.result]);

  return {
    state,
    isPlaying,
    speed,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    step: () => {
      setIsPlaying(false);
      step();
    },
    setSpeed,
  };
}
