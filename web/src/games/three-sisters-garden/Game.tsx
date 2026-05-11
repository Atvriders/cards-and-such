import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeSistersGardenState, ThreeSistersGardenAction, ThreeSistersGardenSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function ThreeSistersGardenGame({ state, dispatch, onGameOver }: GameProps<ThreeSistersGardenState, ThreeSistersGardenSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="tsg-wrap">
      <header className="tsg-head">
        <h2 className="tsg-title">Three Sisters Garden</h2>
        <div className="tsg-meta">
          <span className="tsg-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="tsg-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="tsg-die-area">
          <div className="tsg-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="tsg-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="tsg-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-three-sisters-garden-mark"
            key={i}
            className={`tsg-cell tsg-z${cellZone(i)}${filled ? " tsg-on" : ""}`}
            disabled={filled || state.phase !== "marking" || (state.phase as string) === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as ThreeSistersGardenAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="tsg-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-three-sisters-garden-roll" className="tsg-btn tsg-btn-primary" onClick={() => dispatch({ type: "roll" } as ThreeSistersGardenAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-three-sisters-garden-skip" className="tsg-btn tsg-btn-skip" onClick={() => dispatch({ type: "skip" } as ThreeSistersGardenAction)}>Skip</button>
        )}
        <button className="tsg-btn tsg-btn-reset" onClick={() => dispatch({ type: "reset" } as ThreeSistersGardenAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="tsg-done">Final score: <b>{final}</b></div>
      )}
      <div className="tsg-rules">Adjacent same value: +harvest bonus</div>
    </div>
  );
}
