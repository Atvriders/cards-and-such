import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JuiceJamboreeState, JuiceJamboreeAction, JuiceJamboreeSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function JuiceJamboreeGame({ state, dispatch, onGameOver }: GameProps<JuiceJamboreeState, JuiceJamboreeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as JuiceJamboreeAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="juice-wrap"><div className="juice-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="juice-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="juice-wrap">
      <div className="juice-header">
        <span className="juice-info">Clicked: {state.clicked}</span>
        <span className="juice-timer">{state.ticksRemaining}s</span>
        <span className="juice-score">{state.score} pts</span>
      </div>
      <div className="juice-board" style={{ background: "linear-gradient(180deg,#fff7e6,#ffe2a8)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="juice-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as JuiceJamboreeAction)}
              aria-label="juice-jamboree">🍹</button>
          );
        })}
      </div>
    </div>
  );
}
