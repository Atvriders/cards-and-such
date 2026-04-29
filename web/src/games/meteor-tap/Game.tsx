import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MeteorTapState, MeteorTapAction, MeteorTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function MeteorTapGame({ state, dispatch, onGameOver }: GameProps<MeteorTapState, MeteorTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MeteorTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="meteortap-wrap"><div className="meteortap-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="meteortap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="meteortap-wrap">
      <div className="meteortap-header">
        <span className="meteortap-info">Popped: {state.popped}</span>
        <span className="meteortap-timer">{state.ticksRemaining}s</span>
        <span className="meteortap-score">{state.score} pts</span>
      </div>
      <div className="meteortap-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="meteortap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as MeteorTapAction)}
              aria-label="target">☄️</button>
          );
        })}
      </div>
    </div>
  );
}
