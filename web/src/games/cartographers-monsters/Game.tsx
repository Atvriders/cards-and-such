import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CartographersMonstersState, CartographersMonstersAction, CartographersMonstersSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CartographersMonstersGame({ state, dispatch, onGameOver }: GameProps<CartographersMonstersState, CartographersMonstersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="ctm-wrap">
      <header className="ctm-head">
        <h2 className="ctm-title">Cartographers Monsters</h2>
        <div className="ctm-meta">
          <span className="ctm-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ctm-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ctm-die-area">
          <div className="ctm-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ctm-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ctm-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-cartographers-monsters-mark"
            key={i}
            className={`ctm-cell ctm-z${cellZone(i)}${filled ? " ctm-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersMonstersAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ctm-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cartographers-monsters-roll" className="ctm-btn ctm-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersMonstersAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-cartographers-monsters-skip" className="ctm-btn ctm-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersMonstersAction)}>Skip</button>
        )}
        <button className="ctm-btn ctm-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersMonstersAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ctm-done">Final score: <b>{final}</b></div>
      )}
      <div className="ctm-rules">Monster (rolls 1-2) penalize neighbors</div>
    </div>
  );
}
