import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LimeTapState, LimeTapAction, LimeTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function LimeTapGame({ state, dispatch, onGameOver }: GameProps<LimeTapState, LimeTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LimeTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="limetap-wrap"><div className="limetap-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="limetap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="limetap-wrap">
      <div className="limetap-header">
        <span className="limetap-info">Popped: {state.popped}</span>
        <span className="limetap-timer">{state.ticksRemaining}s</span>
        <span className="limetap-score">{state.score} pts</span>
      </div>
      <div className="limetap-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="limetap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as LimeTapAction)}
              aria-label="target">🟢</button>
          );
        })}
      </div>
    </div>
  );
}
