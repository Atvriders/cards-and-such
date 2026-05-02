import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrackerCrunchState, CrackerCrunchAction, CrackerCrunchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CrackerCrunchGame({ state, dispatch, onGameOver }: GameProps<CrackerCrunchState, CrackerCrunchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CrackerCrunchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="crackercrunch-wrap"><div className="crackercrunch-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="crackercrunch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="crackercrunch-wrap">
      <div className="crackercrunch-header">
        <span className="crackercrunch-info">Popped: {state.popped}</span>
        <span className="crackercrunch-timer">{state.ticksRemaining}s</span>
        <span className="crackercrunch-score">{state.score} pts</span>
      </div>
      <div className="crackercrunch-board" style={{ background: "linear-gradient(180deg,#fff,#fdf2c8)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="crackercrunch-target" data-testid="hint-target-cracker-crunch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CrackerCrunchAction)}
              aria-label="target"
              data-tooltip="Tap to score in Cracker Crunch">🍘</button>
          );
        })}
      </div>
    </div>
  );
}
