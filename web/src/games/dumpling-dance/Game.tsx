import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DumplingDanceState, DumplingDanceAction, DumplingDanceSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function DumplingDanceGame({ state, dispatch, onGameOver }: GameProps<DumplingDanceState, DumplingDanceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as DumplingDanceAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="dumpling-wrap"><div className="dumpling-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="dumpling-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dumpling-wrap">
      <div className="dumpling-header">
        <span className="dumpling-info">Popped: {state.popped}</span>
        <span className="dumpling-timer">{state.ticksRemaining}s</span>
        <span className="dumpling-score">{state.score} pts</span>
      </div>
      <div className="dumpling-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="dumpling-target" data-testid="hint-target-dumpling-dance-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as DumplingDanceAction)}
              aria-label="target">🥟</button>
          );
        })}
      </div>
    </div>
  );
}
