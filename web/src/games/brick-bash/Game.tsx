import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrickBashState, BrickBashAction, BrickBashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function BrickBashGame({ state, dispatch, onGameOver }: GameProps<BrickBashState, BrickBashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BrickBashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ck-wrap"><div className="ck-done"><h2>Time's Up!</h2><div>Hit: {state.hits} / Missed: {state.missed}</div><div className="ck-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ck-wrap">
      <div className="ck-header">
        <span className="ck-info">Hit: {state.hits}</span>
        <span className="ck-timer">{state.ticksRemaining}s</span>
        <span className="ck-score">{state.score} pts</span>
      </div>
      <div className="ck-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ck-target" data-testid="hint-target-brick-bash-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"hit", id:p.id } as BrickBashAction)}
              aria-label="target"
              data-tooltip="Tap to score in Brick Bash">🧱</button>
          );
        })}
      </div>
    </div>
  );
}
