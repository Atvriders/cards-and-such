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
    <div className="ctb-wrap">
      <header className="ctb-head">
        <h2 className="ctb-title">Cartographers Base</h2>
        <div className="ctb-meta">
          <span className="ctb-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ctb-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ctb-die-area">
          <div className="ctb-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ctb-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ctb-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`ctb-cell ctb-z${cellZone(i)}${filled ? " ctb-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersBaseAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ctb-controls">
        {state.phase === "rolling" && (
          <button className="ctb-btn ctb-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersBaseAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="ctb-btn ctb-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersBaseAction)}>Skip</button>
        )}
        <button className="ctb-btn ctb-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersBaseAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ctb-done">Final score: <b>{final}</b></div>
      )}
      <div className="ctb-rules">Each terrain type: bonus per group</div>
    </div>
  );
}
