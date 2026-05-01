import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DonutDashState, DonutDashAction, DonutDashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function DonutDashGame({ state, dispatch, onGameOver }: GameProps<DonutDashState, DonutDashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as DonutDashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="donutdash-wrap"><div className="donutdash-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="donutdash-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="donutdash-wrap">
      <div className="donutdash-header">
        <span className="donutdash-info">Popped: {state.popped}</span>
        <span className="donutdash-timer">{state.ticksRemaining}s</span>
        <span className="donutdash-score">{state.score} pts</span>
      </div>
      <div className="donutdash-board">
        {state.items.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="donutdash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as DonutDashAction)}
              aria-label="Donut Dash">🍩</button>
          );
        })}
      </div>
    </div>
  );
}
