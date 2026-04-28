import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NinjaWallMiniState, NinjaWallMiniAction, NinjaWallMiniSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function NinjaWallMiniGame({ state, dispatch, onGameOver }: GameProps<NinjaWallMiniState, NinjaWallMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as NinjaWallMiniAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="cl-wrap"><div className="cl-done"><h2>Time's Up!</h2><div>Hits: {state.hits} / Misses: {state.misses}</div><div className="cl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cl-wrap">
      <div className="cl-header">
        <span className="cl-info">Hits: {state.hits}</span>
        <span className="cl-timer">{state.ticksRemaining}s</span>
        <span className="cl-score">{state.score} pts</span>
      </div>
      <div className="cl-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id} className="cl-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type: "hit", id: p.id } as NinjaWallMiniAction)}
              aria-label="target">🥷</button>
          );
        })}
      </div>
    </div>
  );
}
