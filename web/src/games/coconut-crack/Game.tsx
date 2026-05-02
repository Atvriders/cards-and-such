import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoconutCrackState, CoconutCrackAction, CoconutCrackSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";
export function CoconutCrackGame({ state, dispatch, onGameOver }: GameProps<CoconutCrackState, CoconutCrackSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CoconutCrackAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="coconutcrack-wrap"><div className="coconutcrack-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="coconutcrack-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="coconutcrack-wrap">
      <div className="coconutcrack-header">
        <span className="coconutcrack-info">Popped: {state.popped}</span>
        <span className="coconutcrack-timer">{state.ticksRemaining}s</span>
        <span className="coconutcrack-score">{state.score} pts</span>
      </div>
      <div className="coconutcrack-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="coconutcrack-target" data-testid="hint-target-coconut-crack-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CoconutCrackAction)}
              aria-label="target"
              data-tooltip="Tap to score in Coconut Crack">🥥</button>
          );
        })}
      </div>
    </div>
  );
}
