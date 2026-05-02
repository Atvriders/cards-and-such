import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RadishRushState, RadishRushAction, RadishRushSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function RadishRushGame({ state, dispatch, onGameOver }: GameProps<RadishRushState, RadishRushSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as RadishRushAction), 700);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="radish-wrap"><div className="radish-done"><h2>Time's Up!</h2><div>Picked: {state.popped} / Missed: {state.missed}</div><div className="radish-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="radish-wrap">
      <div className="radish-header">
        <span className="radish-info">Picked: {state.popped}</span>
        <span className="radish-timer">{state.ticksRemaining}s</span>
        <span className="radish-score">{state.score} pts</span>
      </div>
      <div className="radish-board">
        {state.radishes.map(r => {
          const x = (r.lane + 0.5) / LANES * 100;
          const y = 20 + ((r.ticksLeft * 23) % 70);
          return (
            <button key={r.id}
              className="radish-target" data-testid="hint-target-radish-rush-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:r.id } as RadishRushAction)}
              aria-label="radish">🥕</button>
          );
        })}
      </div>
    </div>
  );
}
