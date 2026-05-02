import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SquirrelSpotState, SquirrelSpotAction, SquirrelSpotSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function SquirrelSpotGame({ state, dispatch, onGameOver }: GameProps<SquirrelSpotState, SquirrelSpotSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SquirrelSpotAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="sqs-wrap"><div className="sqs-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="sqs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="sqs-wrap">
      <div className="sqs-header">
        <span className="sqs-info">Clicked: {state.clicked}</span>
        <span className="sqs-timer">{state.ticksRemaining}s</span>
        <span className="sqs-score">{state.score} pts</span>
      </div>
      <div className="sqs-board" style={{ background: "linear-gradient(180deg,#a16207,#422006)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="sqs-target" data-testid="hint-target-squirrel-spot-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as SquirrelSpotAction)}
              aria-label="squirrel-spot">🐿️</button>
          );
        })}
      </div>
    </div>
  );
}
