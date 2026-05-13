import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeahorseSpinState, SeahorseSpinAction, SeahorseSpinSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function SeahorseSpinGame({ state, dispatch, onGameOver }: GameProps<SeahorseSpinState, SeahorseSpinSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SeahorseSpinAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="shs-wrap"><div className="shs-done bounce-in"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="shs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="shs-wrap fade-in">
      <div className="shs-header">
        <span className="shs-info">Caught: {state.popped}</span>
        <span className="shs-timer">{state.ticksRemaining}s</span>
        <span className="shs-score pulse">{state.score} pts</span>
      </div>
      <div className="shs-board" style={{ background: "linear-gradient(180deg,#67e8f9,#0e7490)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="shs-target" data-testid="hint-target-seahorse-spin-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as SeahorseSpinAction)}
              aria-label="seahorse-spin">🐉</button>
          );
        })}
      </div>
    </div>
  );
}
