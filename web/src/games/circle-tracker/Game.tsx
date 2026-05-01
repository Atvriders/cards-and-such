import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CircleTrackerState, CircleTrackerAction, CircleTrackerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CircleTrackerGame({ state, dispatch, onGameOver }: GameProps<CircleTrackerState, CircleTrackerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CircleTrackerAction), 1100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="cirrx-wrap">
        <div className="cirrx-done">
          <h2>Time's Up!</h2>
          <div className="cirrx-stats">Hits: {state.hits} / Misses: {state.misses}</div>
          <div className="cirrx-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="cirrx-wrap">
      <div className="cirrx-header">
        <span className="cirrx-info">Hits: {state.hits}</span>
        <span className="cirrx-timer">{state.ticksRemaining}s</span>
        <span className="cirrx-score">{state.score} pts</span>
      </div>
      <div className="cirrx-prompt">Track the circle — tap when blue!</div>
      <button
        className={`cirrx-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as CircleTrackerAction)}
        aria-label="react">{state.isGo ? "🔵" : "⚫"}</button>
      <div className="cirrx-hint">Click big button when shown a GO signal — miss when it's NOT GO</div>
    </div>
  );
}
