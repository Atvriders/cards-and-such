import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OctopusTapState, OctopusTapAction, OctopusTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function OctopusTapGame({ state, dispatch, onGameOver }: GameProps<OctopusTapState, OctopusTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as OctopusTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ot-wrap"><div className="ot-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ot-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ot-wrap">
      <div className="ot-header">
        <span className="ot-info">Caught: {state.popped}</span>
        <span className="ot-timer">{state.ticksRemaining}s</span>
        <span className="ot-score">{state.score} pts</span>
      </div>
      <div className="ot-board" style={{ background: "linear-gradient(180deg,#c4b5fd,#5b21b6)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ot-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as OctopusTapAction)}
              aria-label="octopus-tap">🐙</button>
          );
        })}
      </div>
    </div>
  );
}
