import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GoldfishGrabState, GoldfishGrabAction, GoldfishGrabSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function GoldfishGrabGame({ state, dispatch, onGameOver }: GameProps<GoldfishGrabState, GoldfishGrabSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as GoldfishGrabAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="gg-wrap"><div className="gg-done"><h2>Time's Up!</h2><div>Grabbed: {state.popped} / Missed: {state.missed}</div><div className="gg-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="gg-wrap">
      <div className="gg-header">
        <span className="gg-info">Grabbed: {state.popped}</span>
        <span className="gg-timer">{state.ticksRemaining}s</span>
        <span className="gg-score">{state.score} pts</span>
      </div>
      <div className="gg-board" style={{ background: "linear-gradient(180deg,#bae6fd,#0369a1)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="gg-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as GoldfishGrabAction)}
              aria-label="goldfish-grab">🐟</button>
          );
        })}
      </div>
    </div>
  );
}
