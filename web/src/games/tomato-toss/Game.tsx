import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TomatoTossState, TomatoTossAction, TomatoTossSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function TomatoTossGame({ state, dispatch, onGameOver }: GameProps<TomatoTossState, TomatoTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as TomatoTossAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="tomatotoss-wrap"><div className="tomatotoss-done"><h2>Time's Up!</h2><div>clicked: {state.clicked} / Missed: {state.missed}</div><div className="tomatotoss-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="tomatotoss-wrap">
      <div className="tomatotoss-header">
        <span className="tomatotoss-info">clicked: {state.clicked}</span>
        <span className="tomatotoss-timer">{state.ticksRemaining}s</span>
        <span className="tomatotoss-score">{state.score} pts</span>
      </div>
      <div className="tomatotoss-board">
        {state.items.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="tomatotoss-target" data-testid="hint-target-tomato-toss-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"click", id:c.id } as TomatoTossAction)}
              aria-label="tomato-toss">🍅</button>
          );
        })}
      </div>
    </div>
  );
}
