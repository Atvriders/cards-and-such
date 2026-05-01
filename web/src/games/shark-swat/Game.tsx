import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SharkSwatState, SharkSwatAction, SharkSwatSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function SharkSwatGame({ state, dispatch, onGameOver }: GameProps<SharkSwatState, SharkSwatSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SharkSwatAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ss-wrap"><div className="ss-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ss-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ss-wrap">
      <div className="ss-header">
        <span className="ss-info">Caught: {state.popped}</span>
        <span className="ss-timer">{state.ticksRemaining}s</span>
        <span className="ss-score">{state.score} pts</span>
      </div>
      <div className="ss-board" style={{ background: "linear-gradient(180deg,#cbd5e1,#1e293b)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ss-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as SharkSwatAction)}
              aria-label="shark-swat">🦈</button>
          );
        })}
      </div>
    </div>
  );
}
