import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CartographersBaseState, CartographersBaseAction, CartographersBaseSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CartographersBaseGame({ state, dispatch, onGameOver }: GameProps<CartographersBaseState, CartographersBaseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="ctgb-wrap">
      <header className="ctgb-head">
        <h2 className="ctgb-title">Cartographers Base</h2>
        <div className="ctgb-meta">
          <span className="ctgb-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ctgb-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ctgb-die-area">
          <div className="ctgb-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ctgb-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ctgb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-cartographers-base-mark"
            key={i}
            className={`ctgb-cell ctgb-z${cellZone(i)}${filled ? " ctgb-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersBaseAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ctgb-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cartographers-base-roll" className="ctgb-btn ctgb-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersBaseAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-cartographers-base-skip" className="ctgb-btn ctgb-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersBaseAction)}>Skip</button>
        )}
        <button className="ctgb-btn ctgb-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersBaseAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ctgb-done">Final score: <b>{final}</b></div>
      )}
      <div className="ctgb-rules">Each terrain type: bonus per group</div>
    </div>
  );
}
