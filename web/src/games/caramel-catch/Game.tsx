import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaramelCatchState, CaramelCatchAction, CaramelCatchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CaramelCatchGame({ state, dispatch, onGameOver }: GameProps<CaramelCatchState, CaramelCatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CaramelCatchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="caramelcatch-wrap"><div className="caramelcatch-done"><h2>Time's Up!</h2><div>Caught: {state.caught} / Missed: {state.missed}</div><div className="caramelcatch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="caramelcatch-wrap">
      <div className="caramelcatch-header">
        <span className="caramelcatch-info">Caught: {state.caught}</span>
        <span className="caramelcatch-timer">{state.ticksRemaining}s</span>
        <span className="caramelcatch-score">{state.score} pts</span>
      </div>
      <div className="caramelcatch-board" style={{ background: "linear-gradient(180deg,#fff8dc,#d2a366)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="caramelcatch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"catch", id:p.id } as CaramelCatchAction)}
              aria-label="target">🍯</button>
          );
        })}
      </div>
    </div>
  );
}
