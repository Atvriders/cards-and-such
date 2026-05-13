import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PretzelPinchState, PretzelPinchAction, PretzelPinchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function PretzelPinchGame({ state, dispatch, onGameOver }: GameProps<PretzelPinchState, PretzelPinchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PretzelPinchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="pretzelpinch-wrap"><div className="pretzelpinch-done bounce-in"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="pretzelpinch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pretzelpinch-wrap fade-in">
      <div className="pretzelpinch-header">
        <span className="pretzelpinch-info">Popped: {state.popped}</span>
        <span className="pretzelpinch-timer">{state.ticksRemaining}s</span>
        <span className="pretzelpinch-score pulse">{state.score} pts</span>
      </div>
      <div className="pretzelpinch-board" style={{ background: "linear-gradient(180deg,#fdf2e1,#e7c89c)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="pretzelpinch-target" data-testid="hint-target-pretzel-pinch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as PretzelPinchAction)}
              aria-label="target">🥨</button>
          );
        })}
      </div>
    </div>
  );
}
