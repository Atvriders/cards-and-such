import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TangerineTossState, TangerineTossAction, TangerineTossSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function TangerineTossGame({ state, dispatch, onGameOver }: GameProps<TangerineTossState, TangerineTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TangerineTossAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="tangerine-wrap"><div className="tangerine-done"><h2>Time's Up!</h2><div>Tossed: {state.popped} / Missed: {state.missed}</div><div className="tangerine-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="tangerine-wrap">
      <div className="tangerine-header">
        <span className="tangerine-info">Tossed: {state.popped}</span>
        <span className="tangerine-timer">{state.ticksRemaining}s</span>
        <span className="tangerine-score">{state.score} pts</span>
      </div>
      <div className="tangerine-board">
        {state.tangerines.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="tangerine-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as TangerineTossAction)}
              aria-label="tangerine">🍊</button>
          );
        })}
        <div style={{ position:"absolute", bottom:"6px", right:"10px", fontSize:"2.5rem" }}>🗑️</div>
      </div>
    </div>
  );
}
