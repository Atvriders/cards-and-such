import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AppleTapState, AppleTapAction, AppleTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function AppleTapGame({ state, dispatch, onGameOver }: GameProps<AppleTapState, AppleTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AppleTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="appletap-wrap"><div className="appletap-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="appletap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="appletap-wrap">
      <div className="appletap-header">
        <span className="appletap-info">Popped: {state.popped}</span>
        <span className="appletap-timer">{state.ticksRemaining}s</span>
        <span className="appletap-score">{state.score} pts</span>
      </div>
      <div className="appletap-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="appletap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as AppleTapAction)}
              aria-label="target"
              data-tooltip="Tap to score in Apple Tap">🍎</button>
          );
        })}
      </div>
    </div>
  );
}
