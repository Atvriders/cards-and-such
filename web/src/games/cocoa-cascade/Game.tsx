import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CocoaCascadeState, CocoaCascadeAction, CocoaCascadeSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function CocoaCascadeGame({ state, dispatch, onGameOver }: GameProps<CocoaCascadeState, CocoaCascadeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CocoaCascadeAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="cocoa-wrap"><div className="cocoa-done"><h2>Time's Up!</h2><div>Clicked: {state.clicked} / Missed: {state.missed}</div><div className="cocoa-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cocoa-wrap">
      <div className="cocoa-header">
        <span className="cocoa-info">Clicked: {state.clicked}</span>
        <span className="cocoa-timer">{state.ticksRemaining}s</span>
        <span className="cocoa-score">{state.score} pts</span>
      </div>
      <div className="cocoa-board" style={{ background: "linear-gradient(180deg,#5d3a1e,#8b5a2b)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="cocoa-target" data-testid="hint-target-cocoa-cascade-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"click", id:p.id } as CocoaCascadeAction)}
              aria-label="cocoa-cascade"
              data-tooltip="Tap to score in Cocoa Cascade">🍫</button>
          );
        })}
      </div>
    </div>
  );
}
