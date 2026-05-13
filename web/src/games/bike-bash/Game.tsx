import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BikeBashState, BikeBashAction, BikeBashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BikeBashGame({ state, dispatch, onGameOver }: GameProps<BikeBashState, BikeBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BikeBashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="bbs-wrap"><div className="bbs-done bounce-in"><h2>Time's Up!</h2><div>Tapped: {state.popped} / Missed: {state.missed}</div><div className="bbs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bbs-wrap fade-in">
      <div className="bbs-header">
        <span className="bbs-info">Tapped: {state.popped}</span>
        <span className="bbs-timer">{state.ticksRemaining}s</span>
        <span className="bbs-score pulse">{state.score} pts</span>
      </div>
      <div className="bbs-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="bbs-target" data-testid="hint-target-bike-bash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as BikeBashAction)}
              aria-label="vehicle"
              data-tooltip="Tap to score in Bike Bash">🚲</button>
          );
        })}
      </div>
    </div>
  );
}
