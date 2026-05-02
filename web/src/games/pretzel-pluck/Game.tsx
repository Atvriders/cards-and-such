import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PretzelPluckState, PretzelPluckAction, PretzelPluckSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PretzelPluckGame({ state, dispatch, onGameOver }: GameProps<PretzelPluckState, PretzelPluckSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PretzelPluckAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pretzel-wrap"><div className="pretzel-done"><h2>Time's Up!</h2><div>Plucked: {state.popped} / Missed: {state.missed}</div><div className="pretzel-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pretzel-wrap">
      <div className="pretzel-header">
        <span className="pretzel-info">Plucked: {state.popped}</span>
        <span className="pretzel-timer">{state.ticksRemaining}s</span>
        <span className="pretzel-score">{state.score} pts</span>
      </div>
      <div className="pretzel-board">
        {state.pretzels.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pretzel-target" data-testid="hint-target-pretzel-pluck-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as PretzelPluckAction)}
              aria-label="pretzel">🥨</button>
          );
        })}
      </div>
    </div>
  );
}
