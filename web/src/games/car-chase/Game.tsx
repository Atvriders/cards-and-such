import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarChaseState, CarChaseAction, CarChaseSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CarChaseGame({ state, dispatch, onGameOver }: GameProps<CarChaseState, CarChaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CarChaseAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ccc-wrap"><div className="ccc-done"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="ccc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ccc-wrap">
      <div className="ccc-header">
        <span className="ccc-info">Tapped: {state.popped}</span>
        <span className="ccc-timer">{state.ticksRemaining}s</span>
        <span className="ccc-score">{state.score} pts</span>
      </div>
      <div className="ccc-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ccc-target" data-testid="hint-target-car-chase-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CarChaseAction)}
              aria-label="vehicle"
              data-tooltip="Tap to score in Car Chase">🚗</button>
          );
        })}
      </div>
    </div>
  );
}
