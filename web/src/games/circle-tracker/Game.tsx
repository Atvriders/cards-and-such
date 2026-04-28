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
    return <div className="rx-wrap"><div className="rx-done"><h2>Time's Up!</h2><div>Hits: {state.hits} / Misses: {state.misses}</div><div className="rx-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="rx-wrap">
      <div className="rx-header">
        <span className="rx-info">Hits: {state.hits}</span>
        <span className="rx-timer">{state.ticksRemaining}s</span>
        <span className="rx-score">{state.score} pts</span>
      </div>
      <div className="rx-prompt">Tap when the target appears. Don't tap when blank!</div>
      <button
        className={`rx-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as CircleTrackerAction)}
        aria-label="react">🎯</button>
    </div>
  );
}
