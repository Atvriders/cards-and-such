import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollingAmericaState, RollingAmericaAction, RollingAmericaSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RollingAmericaGame({ state, dispatch, onGameOver }: GameProps<RollingAmericaState, RollingAmericaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="rma-wrap">
      <header className="rma-head">
        <h2 className="rma-title">Rolling America</h2>
        <div className="rma-meta">
          <span className="rma-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rma-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="rma-die-area">
          <div className="rma-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="rma-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="rma-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-rolling-america-mark"
            key={i}
            className={`rma-cell rma-z${cellZone(i)}${filled ? " rma-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as RollingAmericaAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="rma-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-rolling-america-roll" className="rma-btn rma-btn-primary" onClick={() => dispatch({ type: "roll" } as RollingAmericaAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-rolling-america-skip" className="rma-btn rma-btn-skip" onClick={() => dispatch({ type: "skip" } as RollingAmericaAction)}>Skip</button>
        )}
        <button className="rma-btn rma-btn-reset" onClick={() => dispatch({ type: "reset" } as RollingAmericaAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="rma-done">Final score: <b>{final}</b></div>
      )}
      <div className="rma-rules">Adjacent regions must differ by ≤1</div>
    </div>
  );
}
