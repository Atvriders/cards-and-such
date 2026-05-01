import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimonPatternState, SimonPatternAction, SimonPatternSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SimonPatternGame({ state, dispatch, onGameOver }: GameProps<SimonPatternState, SimonPatternSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SimonPatternAction), 1100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="smnpat-wrap">
        <div className="smnpat-done">
          <h2>Time's Up!</h2>
          <div className="smnpat-stats">Hits: {state.hits} / Misses: {state.misses}</div>
          <div className="smnpat-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="smnpat-wrap">
      <div className="smnpat-header">
        <span className="smnpat-info">Hits: {state.hits}</span>
        <span className="smnpat-timer">{state.ticksRemaining}s</span>
        <span className="smnpat-score">{state.score} pts</span>
      </div>
      <div className="smnpat-prompt">Watch for the GO beat — tap on rhythm!</div>
      <button
        className={`smnpat-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as SimonPatternAction)}
        aria-label="react">{state.isGo ? "🎵" : "🔇"}</button>
      <div className="smnpat-hint">Click big button when shown a GO signal — miss when it's NOT GO</div>
    </div>
  );
}
