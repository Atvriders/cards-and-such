import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NochMalCrossState, NochMalCrossAction, NochMalCrossSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function NochMalCrossGame({ state, dispatch, onGameOver }: GameProps<NochMalCrossState, NochMalCrossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="nmc-wrap">
      <header className="nmc-head">
        <h2 className="nmc-title">Noch Mal Cross</h2>
        <div className="nmc-meta">
          <span className="nmc-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="nmc-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="nmc-die-area">
          <div className="nmc-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="nmc-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="nmc-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-noch-mal-cross-mark"
            key={i}
            className={`nmc-cell nmc-z${cellZone(i)}${filled ? " nmc-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as NochMalCrossAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="nmc-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-noch-mal-cross-roll" className="nmc-btn nmc-btn-primary" onClick={() => dispatch({ type: "roll" } as NochMalCrossAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-noch-mal-cross-skip" className="nmc-btn nmc-btn-skip" onClick={() => dispatch({ type: "skip" } as NochMalCrossAction)}>Skip</button>
        )}
        <button className="nmc-btn nmc-btn-reset" onClick={() => dispatch({ type: "reset" } as NochMalCrossAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="nmc-done">Final score: <b>{final}</b></div>
      )}
      <div className="nmc-rules">Column complete: +column number</div>
    </div>
  );
}
