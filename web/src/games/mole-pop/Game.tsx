import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MolePopState, MolePopAction, MolePopSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MolePop({ state, dispatch, onGameOver }: GameProps<MolePopState, MolePopSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "active") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MolePopAction), 120);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="mp-wrap"><div className="mp-done"><h2>Game Over!</h2>
      <p>Hits: {state.hits} | Misses: {state.misses}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#795548" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="mp-wrap">
      <div className="mp-header"><span>Mole {state.round} / {state.maxRounds}</span><span className="mp-score">{state.score} pts</span></div>
      <div className="mp-timer" style={{ width: `${(state.ticksRemaining / state.visibleFor) * 100}%` }} />
      <div className="mp-grid">
        {[0,1,2,3,4,5].map(i => (
          <button data-testid="hint-target-mole-pop-action" key={i} className={`mp-hole ${state.activeMole === i ? "active" : ""}`}
            title="Whack mole" onClick={() => dispatch({ type: "whack", hole: i } as MolePopAction)}>
            {state.activeMole === i ? "🦔" : "○"}
          </button>
        ))}
      </div>
      <p className="mp-hint">Whack the mole before it disappears! Hits: {state.hits}</p>
    </div>
  );
}
