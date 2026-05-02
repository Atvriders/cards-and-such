import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CroissantCatchState, CroissantCatchAction, CroissantCatchSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CroissantCatchGame({ state, dispatch, onGameOver }: GameProps<CroissantCatchState, CroissantCatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CroissantCatchAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="croissantcatch-wrap"><div className="croissantcatch-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="croissantcatch-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="croissantcatch-wrap">
      <div className="croissantcatch-header">
        <span className="croissantcatch-info">Popped: {state.popped}</span>
        <span className="croissantcatch-timer">{state.ticksRemaining}s</span>
        <span className="croissantcatch-score">{state.score} pts</span>
      </div>
      <div className="croissantcatch-board">
        {state.items.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="croissantcatch-target" data-testid="hint-target-croissant-catch-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CroissantCatchAction)}
              aria-label="Croissant Catch">🥐</button>
          );
        })}
      </div>
    </div>
  );
}
