import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuppyTapState, PuppyTapAction, PuppyTapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PuppyTapGame({ state, dispatch, onGameOver }: GameProps<PuppyTapState, PuppyTapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PuppyTapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pt-wrap"><div className="pt-done"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="pt-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pt-wrap">
      <div className="pt-header">
        <span className="pt-info">Tapped: {state.popped}</span>
        <span className="pt-timer">{state.ticksRemaining}s</span>
        <span className="pt-score">{state.score} pts</span>
      </div>
      <div className="pt-board" style={{ background: "linear-gradient(180deg,#fed7aa,#c2410c)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pt-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as PuppyTapAction)}
              aria-label="puppy-tap">🐶</button>
          );
        })}
      </div>
    </div>
  );
}
