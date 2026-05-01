import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LollipopLiftState, LollipopLiftAction, LollipopLiftSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function LollipopLiftGame({ state, dispatch, onGameOver }: GameProps<LollipopLiftState, LollipopLiftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LollipopLiftAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="lollipoplift-wrap"><div className="lollipoplift-done"><h2>Time's Up!</h2><div>Caught: {state.caught} / Missed: {state.missed}</div><div className="lollipoplift-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="lollipoplift-wrap">
      <div className="lollipoplift-header">
        <span className="lollipoplift-info">Caught: {state.caught}</span>
        <span className="lollipoplift-timer">{state.ticksRemaining}s</span>
        <span className="lollipoplift-score">{state.score} pts</span>
      </div>
      <div className="lollipoplift-board" style={{ background: "linear-gradient(180deg,#ffe4f0,#ffaad4)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="lollipoplift-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"catch", id:p.id } as LollipopLiftAction)}
              aria-label="target">🍭</button>
          );
        })}
      </div>
    </div>
  );
}
