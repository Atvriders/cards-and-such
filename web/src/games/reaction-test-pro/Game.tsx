import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReactionTestProState, ReactionTestProAction, ReactionTestProSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ReactionTestProGame({ state, dispatch, onGameOver }: GameProps<ReactionTestProState, ReactionTestProSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ReactionTestProAction), 1100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="rxtstp-wrap">
        <div className="rxtstp-done">
          <h2>Time's Up!</h2>
          <div className="rxtstp-stats">Hits: {state.hits} / Misses: {state.misses}</div>
          <div className="rxtstp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="rxtstp-wrap">
      <div className="rxtstp-header">
        <span className="rxtstp-info">Hits: {state.hits}</span>
        <span className="rxtstp-timer">{state.ticksRemaining}s</span>
        <span className="rxtstp-score">{state.score} pts</span>
      </div>
      <div className="rxtstp-prompt">Pro reflexes — tap GO instantly!</div>
      <button data-testid="hint-target-reaction-test-pro-action"
        className={`rxtstp-stage ${state.isGo ? "go" : "nogo"}`}
        onClick={() => dispatch({ type: "react" } as ReactionTestProAction)}
        aria-label="react">{state.isGo ? "⚡" : "🛑"}</button>
      <div className="rxtstp-hint">Click big button when shown a GO signal — miss when it's NOT GO</div>
    </div>
  );
}
