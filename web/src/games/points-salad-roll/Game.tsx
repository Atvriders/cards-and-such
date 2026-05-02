import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PointsSaladRollState, PointsSaladRollAction, PointsSaladRollSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function PointsSaladRollGame({ state, dispatch, onGameOver }: GameProps<PointsSaladRollState, PointsSaladRollSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="psr-wrap">
      <header className="psr-head">
        <h2 className="psr-title">Points Salad Roll</h2>
        <div className="psr-meta">
          <span className="psr-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="psr-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="psr-die-area">
          <div className="psr-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="psr-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="psr-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-points-salad-roll-mark"
            key={i}
            className={`psr-cell psr-z${cellZone(i)}${filled ? " psr-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as PointsSaladRollAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="psr-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-points-salad-roll-roll" className="psr-btn psr-btn-primary" onClick={() => dispatch({ type: "roll" } as PointsSaladRollAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-points-salad-roll-skip" className="psr-btn psr-btn-skip" onClick={() => dispatch({ type: "skip" } as PointsSaladRollAction)}>Skip</button>
        )}
        <button className="psr-btn psr-btn-reset" onClick={() => dispatch({ type: "reset" } as PointsSaladRollAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="psr-done">Final score: <b>{final}</b></div>
      )}
      <div className="psr-rules">Each cell scores per its rule</div>
    </div>
  );
}
