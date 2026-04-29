import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightningTapState, LightningTapAction, LightningTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function LightningTapGame({ state, dispatch, onGameOver }: GameProps<LightningTapState, LightningTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LightningTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="lightningtap-wrap"><div className="lightningtap-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="lightningtap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="lightningtap-wrap">
      <div className="lightningtap-header">
        <span className="lightningtap-info">Popped: {state.popped}</span>
        <span className="lightningtap-timer">{state.ticksRemaining}s</span>
        <span className="lightningtap-score">{state.score} pts</span>
      </div>
      <div className="lightningtap-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="lightningtap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as LightningTapAction)}
              aria-label="target">⚡</button>
          );
        })}
      </div>
    </div>
  );
}
