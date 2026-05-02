import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PeachPopState, PeachPopAction, PeachPopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PeachPopGame({ state, dispatch, onGameOver }: GameProps<PeachPopState, PeachPopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PeachPopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="peach-wrap"><div className="peach-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="peach-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="peach-wrap">
      <div className="peach-header">
        <span className="peach-info">Popped: {state.popped}</span>
        <span className="peach-timer">{state.ticksRemaining}s</span>
        <span className="peach-score">{state.score} pts</span>
      </div>
      <div className="peach-board">
        {state.peaches.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="peach-target" data-testid="hint-target-peach-pop-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as PeachPopAction)}
              aria-label="peach">🍑</button>
          );
        })}
      </div>
    </div>
  );
}
