import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChipsChompState, ChipsChompAction, ChipsChompSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function ChipsChompGame({ state, dispatch, onGameOver }: GameProps<ChipsChompState, ChipsChompSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ChipsChompAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="chipschomp-wrap"><div className="chipschomp-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="chipschomp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="chipschomp-wrap">
      <div className="chipschomp-header">
        <span className="chipschomp-info">Popped: {state.popped}</span>
        <span className="chipschomp-timer">{state.ticksRemaining}s</span>
        <span className="chipschomp-score">{state.score} pts</span>
      </div>
      <div className="chipschomp-board" style={{ background: "linear-gradient(180deg,#fffbe6,#ffe28c)" }}>
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="chipschomp-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as ChipsChompAction)}
              aria-label="target"
              data-tooltip="Tap to score in Chips Chomp">🍟</button>
          );
        })}
      </div>
    </div>
  );
}
