import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BagelBashState, BagelBashAction, BagelBashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BagelBashGame({ state, dispatch, onGameOver }: GameProps<BagelBashState, BagelBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BagelBashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="bagelbash-wrap"><div className="bagelbash-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="bagelbash-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bagelbash-wrap">
      <div className="bagelbash-header">
        <span className="bagelbash-info">Popped: {state.popped}</span>
        <span className="bagelbash-timer">{state.ticksRemaining}s</span>
        <span className="bagelbash-score">{state.score} pts</span>
      </div>
      <div className="bagelbash-board">
        {state.items.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="bagelbash-target" data-testid="hint-target-bagel-bash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BagelBashAction)}
              aria-label="Bagel Bash"
              data-tooltip="Tap to score in Bagel Bash">🥯</button>
          );
        })}
      </div>
    </div>
  );
}
