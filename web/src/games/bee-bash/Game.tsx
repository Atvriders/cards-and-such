import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeeBashState, BeeBashAction, BeeBashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BeeBashGame({ state, dispatch, onGameOver }: GameProps<BeeBashState, BeeBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BeeBashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="bee-wrap"><div className="bee-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="bee-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bee-wrap">
      <div className="bee-header">
        <span className="bee-info">Caught: {state.popped}</span>
        <span className="bee-timer">{state.ticksRemaining}s</span>
        <span className="bee-score">{state.score} pts</span>
      </div>
      <div className="bee-board" style={{ background: "linear-gradient(180deg,#fef08a,#b45309)" }}>
        {state.bugs.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="bee-target" data-testid="hint-target-bee-bash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BeeBashAction)}
              aria-label="bee-bash"
              data-tooltip="Tap to score in Bee Bash">🐝</button>
          );
        })}
      </div>
    </div>
  );
}
