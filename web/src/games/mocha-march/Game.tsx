import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MochaMarchState, MochaMarchAction, MochaMarchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function MochaMarchGame({ state, dispatch, onGameOver }: GameProps<MochaMarchState, MochaMarchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MochaMarchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="mocha-wrap"><div className="mocha-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="mocha-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="mocha-wrap">
      <div className="mocha-header">
        <span className="mocha-info">Clicked: {state.clicked}</span>
        <span className="mocha-timer">{state.ticksRemaining}s</span>
        <span className="mocha-score">{state.score} pts</span>
      </div>
      <div className="mocha-board" style={{ background: "linear-gradient(180deg,#3a2317,#7c5246)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="mocha-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as MochaMarchAction)}
              aria-label="mocha-march">🤎</button>
          );
        })}
      </div>
    </div>
  );
}
