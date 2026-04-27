import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeahorseSpinState, SeahorseSpinAction, SeahorseSpinSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function SeahorseSpinGame({ state, dispatch, onGameOver }: GameProps<SeahorseSpinState, SeahorseSpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SeahorseSpinAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ar-wrap"><div className="ar-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ar-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ar-wrap">
      <div className="ar-header">
        <span className="ar-info">Caught: {state.popped}</span>
        <span className="ar-timer">{state.ticksRemaining}s</span>
        <span className="ar-score">{state.score} pts</span>
      </div>
      <div className="ar-board">
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ar-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as SeahorseSpinAction)}
              aria-label="critter">🐎</button>
          );
        })}
      </div>
    </div>
  );
}
