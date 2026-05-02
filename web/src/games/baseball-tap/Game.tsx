import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaseballTapState, BaseballTapAction, BaseballTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function BaseballTapGame({ state, dispatch, onGameOver }: GameProps<BaseballTapState, BaseballTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BaseballTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ftap-wrap"><div className="ftap-done"><h2>Time's Up!</h2><div>Hits: {state.popped} / Missed: {state.missed}</div><div className="ftap-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ftap-wrap">
      <div className="ftap-header">
        <span className="ftap-info">Baseball — Hits: {state.popped}</span>
        <span className="ftap-timer">{state.ticksRemaining}s</span>
        <span className="ftap-score">{state.score} pts</span>
      </div>
      <div className="ftap-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ftap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BaseballTapAction)}
              aria-label="target"
              data-tooltip="Tap to score in Baseball Tap">⚾</button>
          );
        })}
      </div>
    </div>
  );
}
