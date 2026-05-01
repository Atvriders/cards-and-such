import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CucumberCatchState, CucumberCatchAction, CucumberCatchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CucumberCatchGame({ state, dispatch, onGameOver }: GameProps<CucumberCatchState, CucumberCatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as CucumberCatchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="cucumbercatch-wrap"><div className="cucumbercatch-done"><h2>Time's Up!</h2><div>Caught: {state.caught} / Missed: {state.missed}</div><div className="cucumbercatch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cucumbercatch-wrap">
      <div className="cucumbercatch-header">
        <span className="cucumbercatch-info">Caught: {state.caught}</span>
        <span className="cucumbercatch-timer">{state.ticksRemaining}s</span>
        <span className="cucumbercatch-score">{state.score} pts</span>
      </div>
      <div className="cucumbercatch-board">
        {state.cucumbers.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="cucumbercatch-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"catch", id:c.id } as CucumberCatchAction)}
              aria-label="cucumber">🥒</button>
          );
        })}
      </div>
    </div>
  );
}
