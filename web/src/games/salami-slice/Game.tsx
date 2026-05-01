import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SalamiSliceState, SalamiSliceAction, SalamiSliceSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function SalamiSliceGame({ state, dispatch, onGameOver }: GameProps<SalamiSliceState, SalamiSliceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SalamiSliceAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="salami-wrap"><div className="salami-done"><h2>Time's Up!</h2><div>Sliced: {state.popped} / Missed: {state.missed}</div><div className="salami-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="salami-wrap">
      <div className="salami-header">
        <span className="salami-info">Sliced: {state.popped}</span>
        <span className="salami-timer">{state.ticksRemaining}s</span>
        <span className="salami-score">{state.score} pts</span>
      </div>
      <div className="salami-board">
        {state.salamis.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="salami-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onMouseEnter={() => dispatch({ type:"pop", id:p.id } as SalamiSliceAction)}
              onClick={() => dispatch({ type:"pop", id:p.id } as SalamiSliceAction)}
              aria-label="salami">🥩</button>
          );
        })}
      </div>
    </div>
  );
}
