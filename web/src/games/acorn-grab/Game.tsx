import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcornGrabState, AcornGrabAction, AcornGrabSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function AcornGrabGame({ state, dispatch, onGameOver }: GameProps<AcornGrabState, AcornGrabSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AcornGrabAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="acg-wrap"><div className="acg-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="acg-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="acg-wrap">
      <div className="acg-header">
        <span className="acg-info">Clicked: {state.clicked}</span>
        <span className="acg-timer">{state.ticksRemaining}s</span>
        <span className="acg-score">{state.score} pts</span>
      </div>
      <div className="acg-board" style={{ background: "linear-gradient(180deg,#92400e,#451a03)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="acg-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as AcornGrabAction)}
              aria-label="acorn-grab"
              data-tooltip="Tap to score in Acorn Grab">🌰</button>
          );
        })}
      </div>
    </div>
  );
}
