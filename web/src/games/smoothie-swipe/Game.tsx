import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SmoothieSwipeState, SmoothieSwipeAction, SmoothieSwipeSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function SmoothieSwipeGame({ state, dispatch, onGameOver }: GameProps<SmoothieSwipeState, SmoothieSwipeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as SmoothieSwipeAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="smoothie-wrap"><div className="smoothie-done"><h2>Time's Up!</h2><div>popped: {state.popped} / Missed: {state.missed}</div><div className="smoothie-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="smoothie-wrap">
      <div className="smoothie-header">
        <span className="smoothie-info">popped: {state.popped}</span>
        <span className="smoothie-timer">{state.ticksRemaining}s</span>
        <span className="smoothie-score">{state.score} pts</span>
      </div>
      <div className="smoothie-board">
        {state.items.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="smoothie-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:c.id } as SmoothieSwipeAction)}
              aria-label="smoothie-swipe">🍓</button>
          );
        })}
      </div>
    </div>
  );
}
