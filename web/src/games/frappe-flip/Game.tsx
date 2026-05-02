import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrappeFlipState, FrappeFlipAction, FrappeFlipSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function FrappeFlipGame({ state, dispatch, onGameOver }: GameProps<FrappeFlipState, FrappeFlipSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as FrappeFlipAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="frappe-wrap"><div className="frappe-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="frappe-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="frappe-wrap">
      <div className="frappe-header">
        <span className="frappe-info">Clicked: {state.clicked}</span>
        <span className="frappe-timer">{state.ticksRemaining}s</span>
        <span className="frappe-score">{state.score} pts</span>
      </div>
      <div className="frappe-board" style={{ background: "linear-gradient(180deg,#f0e3d3,#c89c7c)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="frappe-target" data-testid="hint-target-frappe-flip-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as FrappeFlipAction)}
              aria-label="frappe-flip">🥶</button>
          );
        })}
      </div>
    </div>
  );
}
