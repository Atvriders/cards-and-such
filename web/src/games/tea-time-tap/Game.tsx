import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TeaTimeTapState, TeaTimeTapAction, TeaTimeTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function TeaTimeTapGame({ state, dispatch, onGameOver }: GameProps<TeaTimeTapState, TeaTimeTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as TeaTimeTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="teatap-wrap"><div className="teatap-done"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="teatap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="teatap-wrap">
      <div className="teatap-header">
        <span className="teatap-info">Tapped: {state.popped}</span>
        <span className="teatap-timer">{state.ticksRemaining}s</span>
        <span className="teatap-score">{state.score} pts</span>
      </div>
      <div className="teatap-board">
        {state.cups.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="teatap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:c.id } as TeaTimeTapAction)}
              aria-label="tea">🍵</button>
          );
        })}
      </div>
    </div>
  );
}
