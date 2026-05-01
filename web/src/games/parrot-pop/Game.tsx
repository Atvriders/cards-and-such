import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParrotPopState, ParrotPopAction, ParrotPopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function ParrotPopGame({ state, dispatch, onGameOver }: GameProps<ParrotPopState, ParrotPopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ParrotPopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pp-wrap"><div className="pp-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="pp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pp-wrap">
      <div className="pp-header">
        <span className="pp-info">Popped: {state.popped}</span>
        <span className="pp-timer">{state.ticksRemaining}s</span>
        <span className="pp-score">{state.score} pts</span>
      </div>
      <div className="pp-board" style={{ background: "linear-gradient(180deg,#86efac,#0f766e)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pp-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as ParrotPopAction)}
              aria-label="parrot-pop">🦜</button>
          );
        })}
      </div>
    </div>
  );
}
