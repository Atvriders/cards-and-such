import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KaleKombatState, KaleKombatAction, KaleKombatSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function KaleKombatGame({ state, dispatch, onGameOver }: GameProps<KaleKombatState, KaleKombatSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as KaleKombatAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="kalekombat-wrap"><div className="kalekombat-done"><h2>Time's Up!</h2><div>clicked: {state.clicked} / Missed: {state.missed}</div><div className="kalekombat-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="kalekombat-wrap">
      <div className="kalekombat-header">
        <span className="kalekombat-info">clicked: {state.clicked}</span>
        <span className="kalekombat-timer">{state.ticksRemaining}s</span>
        <span className="kalekombat-score">{state.score} pts</span>
      </div>
      <div className="kalekombat-board">
        {state.items.map(c => {
          const x = (c.lane + 0.5) / LANES * 100;
          const y = 20 + ((c.ticksLeft * 23) % 70);
          return (
            <button key={c.id}
              className="kalekombat-target" data-testid="hint-target-kale-kombat-target"
              style={{ left:`${x}%`, top:`${y}%`, transform:"translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"click", id:c.id } as KaleKombatAction)}
              aria-label="kale-kombat">🥬</button>
          );
        })}
      </div>
    </div>
  );
}
