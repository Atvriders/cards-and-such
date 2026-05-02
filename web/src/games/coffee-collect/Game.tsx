import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoffeeCollectState, CoffeeCollectAction, CoffeeCollectSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CoffeeCollectGame({ state, dispatch, onGameOver }: GameProps<CoffeeCollectState, CoffeeCollectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as CoffeeCollectAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="coffee-wrap"><div className="coffee-done"><h2>Time's Up!</h2><div>popped: {state.popped} / Missed: {state.missed}</div><div className="coffee-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="coffee-wrap">
      <div className="coffee-header">
        <span className="coffee-info">popped: {state.popped}</span>
        <span className="coffee-timer">{state.ticksRemaining}s</span>
        <span className="coffee-score">{state.score} pts</span>
      </div>
      <div className="coffee-board">
        {state.items.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="coffee-target" data-testid="hint-target-coffee-collect-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:c.id } as CoffeeCollectAction)}
              aria-label="coffee-collect"
              data-tooltip="Tap to score in Coffee Collect">☕</button>
          );
        })}
      </div>
    </div>
  );
}
