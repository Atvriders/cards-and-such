import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrabCatchState, CrabCatchAction, CrabCatchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CrabCatchGame({ state, dispatch, onGameOver }: GameProps<CrabCatchState, CrabCatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CrabCatchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="cc-wrap"><div className="cc-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="cc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cc-wrap">
      <div className="cc-header">
        <span className="cc-info">Caught: {state.popped}</span>
        <span className="cc-timer">{state.ticksRemaining}s</span>
        <span className="cc-score">{state.score} pts</span>
      </div>
      <div className="cc-board" style={{ background: "linear-gradient(180deg,#fed7aa,#7c2d12)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="cc-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CrabCatchAction)}
              aria-label="crab-catch"
              data-tooltip="Tap to score in Crab Catch">🦀</button>
          );
        })}
      </div>
    </div>
  );
}
