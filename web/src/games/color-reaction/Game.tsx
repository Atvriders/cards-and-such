import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorReactionState, ColorReactionAction, ColorReactionSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ColorReactionGame({ state, dispatch, onGameOver }: GameProps<ColorReactionState, ColorReactionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ColorReactionAction), 1100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="colrx-wrap">
        <div className="colrx-done">
          <h2>Time's Up!</h2>
          <div className="colrx-stats">Hits: {state.hits} / Misses: {state.misses}</div>
          <div className="colrx-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="colrx-wrap">
      <div className="colrx-header">
        <span className="colrx-info">Hits: {state.hits}</span>
        <span className="colrx-timer">{state.ticksRemaining}s</span>
        <span className="colrx-score">{state.score} pts</span>
      </div>
      <div className="colrx-prompt">Tap when the stage turns GREEN. Avoid tapping red!</div>
      <button
        className={`colrx-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as ColorReactionAction)}
        aria-label="react">{state.isGo ? "🟢" : "🔴"}</button>
      <div className="colrx-hint">Click big button when shown a GO signal — miss when it's NOT GO</div>
    </div>
  );
}
