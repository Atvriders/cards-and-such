import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OwlHootState, OwlHootAction, OwlHootSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function OwlHootGame({ state, dispatch, onGameOver }: GameProps<OwlHootState, OwlHootSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as OwlHootAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="owh-wrap"><div className="owh-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="owh-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="owh-wrap">
      <div className="owh-header">
        <span className="owh-info">Clicked: {state.clicked}</span>
        <span className="owh-timer">{state.ticksRemaining}s</span>
        <span className="owh-score">{state.score} pts</span>
      </div>
      <div className="owh-board" style={{ background: "linear-gradient(180deg,#312e81,#020617)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="owh-target" data-testid="hint-target-owl-hoot-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as OwlHootAction)}
              aria-label="owl-hoot">🦉</button>
          );
        })}
      </div>
    </div>
  );
}
