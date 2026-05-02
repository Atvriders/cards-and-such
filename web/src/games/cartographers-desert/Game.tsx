import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CartographersDesertState, CartographersDesertAction, CartographersDesertSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CartographersDesertGame({ state, dispatch, onGameOver }: GameProps<CartographersDesertState, CartographersDesertSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="ctd-wrap">
      <header className="ctd-head">
        <h2 className="ctd-title">Cartographers Desert</h2>
        <div className="ctd-meta">
          <span className="ctd-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ctd-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ctd-die-area">
          <div className="ctd-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ctd-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ctd-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-cartographers-desert-mark"
            key={i}
            className={`ctd-cell ctd-z${cellZone(i)}${filled ? " ctd-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersDesertAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ctd-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cartographers-desert-roll" className="ctd-btn ctd-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersDesertAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-cartographers-desert-skip" className="ctd-btn ctd-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersDesertAction)}>Skip</button>
        )}
        <button className="ctd-btn ctd-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersDesertAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ctd-done">Final score: <b>{final}</b></div>
      )}
      <div className="ctd-rules">Rolls 5-6: oasis bonus +2</div>
    </div>
  );
}
