import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SecondChanceGridState, SecondChanceGridAction, SecondChanceGridSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function SecondChanceGridGame({ state, dispatch, onGameOver }: GameProps<SecondChanceGridState, SecondChanceGridSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="scg-wrap">
      <header className="scg-head">
        <h2 className="scg-title">Second Chance Grid</h2>
        <div className="scg-meta">
          <span className="scg-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="scg-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="scg-die-area">
          <div className="scg-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="scg-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="scg-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-second-chance-grid-mark"
            key={i}
            className={`scg-cell scg-z${cellZone(i)}${filled ? " scg-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as SecondChanceGridAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="scg-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-second-chance-grid-roll" className="scg-btn scg-btn-primary" onClick={() => dispatch({ type: "roll" } as SecondChanceGridAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-second-chance-grid-skip" className="scg-btn scg-btn-skip" onClick={() => dispatch({ type: "skip" } as SecondChanceGridAction)}>Skip</button>
        )}
        <button className="scg-btn scg-btn-reset" onClick={() => dispatch({ type: "reset" } as SecondChanceGridAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="scg-done">Final score: <b>{final}</b></div>
      )}
      <div className="scg-rules">Used skip = +second chance penalty</div>
    </div>
  );
}
