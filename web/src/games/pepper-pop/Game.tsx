import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PepperPopState, PepperPopAction, PepperPopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PepperPopGame({ state, dispatch, onGameOver }: GameProps<PepperPopState, PepperPopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as PepperPopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pepperpop-wrap"><div className="pepperpop-done"><h2>Time's Up!</h2><div>popped: {state.popped} / Missed: {state.missed}</div><div className="pepperpop-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pepperpop-wrap">
      <div className="pepperpop-header">
        <span className="pepperpop-info">popped: {state.popped}</span>
        <span className="pepperpop-timer">{state.ticksRemaining}s</span>
        <span className="pepperpop-score">{state.score} pts</span>
      </div>
      <div className="pepperpop-board">
        {state.items.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="pepperpop-target" data-testid="hint-target-pepper-pop-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:c.id } as PepperPopAction)}
              aria-label="pepper-pop">🫑</button>
          );
        })}
      </div>
    </div>
  );
}
