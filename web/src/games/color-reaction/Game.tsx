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
      <div className="clrrct-wrap">
        <div className="clrrct-done">
          <h2>Time's Up!</h2>
          <div className="clrrct-stats">Hits: {state.hits} / Misses: {state.misses}</div>
          <div className="clrrct-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="clrrct-wrap">
      <div className="clrrct-header">
        <span className="clrrct-info">Hits: {state.hits}</span>
        <span className="clrrct-timer">{state.ticksRemaining}s</span>
        <span className="clrrct-score">{state.score} pts</span>
      </div>
      <div className="clrrct-prompt">Tap when the stage turns GREEN. Avoid tapping red!</div>
      <button
        className={`clrrct-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as ColorReactionAction)}
        aria-label="react">{state.isGo ? "🟢" : "🔴"}</button>
      <div className="clrrct-hint">Click big button when shown a GO signal — miss when it's NOT GO</div>
    </div>
  );
}
