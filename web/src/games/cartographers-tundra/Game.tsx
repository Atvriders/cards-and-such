import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CartographersTundraState, CartographersTundraAction, CartographersTundraSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CartographersTundraGame({ state, dispatch, onGameOver }: GameProps<CartographersTundraState, CartographersTundraSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="ctt-wrap">
      <header className="ctt-head">
        <h2 className="ctt-title">Cartographers Tundra</h2>
        <div className="ctt-meta">
          <span className="ctt-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ctt-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ctt-die-area">
          <div className="ctt-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ctt-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ctt-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-cartographers-tundra-mark"
            key={i}
            className={`ctt-cell ctt-z${cellZone(i)}${filled ? " ctt-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersTundraAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ctt-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cartographers-tundra-roll" className="ctt-btn ctt-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersTundraAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-cartographers-tundra-skip" className="ctt-btn ctt-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersTundraAction)}>Skip</button>
        )}
        <button className="ctt-btn ctt-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersTundraAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ctt-done">Final score: <b>{final}</b></div>
      )}
      <div className="ctt-rules">Rolls 1-2: ice bonus +3</div>
    </div>
  );
}
