import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrogFlickState, FrogFlickAction, FrogFlickSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function FrogFlickGame({ state, dispatch, onGameOver }: GameProps<FrogFlickState, FrogFlickSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as FrogFlickAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ff-wrap"><div className="ff-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ff-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ff-wrap">
      <div className="ff-header">
        <span className="ff-info">Caught: {state.popped}</span>
        <span className="ff-timer">{state.ticksRemaining}s</span>
        <span className="ff-score">{state.score} pts</span>
      </div>
      <div className="ff-board" style={{ background: "linear-gradient(180deg,#bbf7d0,#15803d)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ff-target" data-testid="hint-target-frog-flick-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as FrogFlickAction)}
              aria-label="frog-flick">🐸</button>
          );
        })}
      </div>
    </div>
  );
}
