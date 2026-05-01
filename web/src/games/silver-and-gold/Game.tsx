import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SilverAndGoldState, SilverAndGoldAction, SilverAndGoldSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function SilverAndGoldGame({ state, dispatch, onGameOver }: GameProps<SilverAndGoldState, SilverAndGoldSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="sag-wrap">
      <header className="sag-head">
        <h2 className="sag-title">Silver & Gold</h2>
        <div className="sag-meta">
          <span className="sag-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="sag-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="sag-die-area">
          <div className="sag-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="sag-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="sag-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`sag-cell sag-z${cellZone(i)}${filled ? " sag-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as SilverAndGoldAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="sag-controls">
        {state.phase === "rolling" && (
          <button className="sag-btn sag-btn-primary" onClick={() => dispatch({ type: "roll" } as SilverAndGoldAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="sag-btn sag-btn-skip" onClick={() => dispatch({ type: "skip" } as SilverAndGoldAction)}>Skip</button>
        )}
        <button className="sag-btn sag-btn-reset" onClick={() => dispatch({ type: "reset" } as SilverAndGoldAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="sag-done">Final score: <b>{final}</b></div>
      )}
      <div className="sag-rules">Filling a shape: +shape size points</div>
    </div>
  );
}
