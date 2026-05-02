import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PopcornPopState, PopcornPopAction, PopcornPopSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PopcornPopGame({ state, dispatch, onGameOver }: GameProps<PopcornPopState, PopcornPopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PopcornPopAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="popcornpop-wrap"><div className="popcornpop-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="popcornpop-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="popcornpop-wrap">
      <div className="popcornpop-header">
        <span className="popcornpop-info">Popped: {state.popped}</span>
        <span className="popcornpop-timer">{state.ticksRemaining}s</span>
        <span className="popcornpop-score">{state.score} pts</span>
      </div>
      <div className="popcornpop-board" style={{ background: "linear-gradient(180deg,#fff,#ffd9d9)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="popcornpop-target" data-testid="hint-target-popcorn-pop-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as PopcornPopAction)}
              aria-label="target">🍿</button>
          );
        })}
      </div>
    </div>
  );
}
