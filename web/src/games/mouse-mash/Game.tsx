import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MouseMashState, MouseMashAction, MouseMashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function MouseMashGame({ state, dispatch, onGameOver }: GameProps<MouseMashState, MouseMashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MouseMashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="mm-wrap"><div className="mm-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="mm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="mm-wrap">
      <div className="mm-header">
        <span className="mm-info">Caught: {state.popped}</span>
        <span className="mm-timer">{state.ticksRemaining}s</span>
        <span className="mm-score">{state.score} pts</span>
      </div>
      <div className="mm-board" style={{ background: "linear-gradient(180deg,#e9d5ff,#7e22ce)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="mm-target" data-testid="hint-target-mouse-mash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as MouseMashAction)}
              aria-label="mouse-mash">🐭</button>
          );
        })}
      </div>
    </div>
  );
}
