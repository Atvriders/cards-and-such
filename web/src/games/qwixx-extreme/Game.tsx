import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxExtremeState, QwixxExtremeAction, QwixxExtremeSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function QwixxExtremeGame({ state, dispatch, onGameOver }: GameProps<QwixxExtremeState, QwixxExtremeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="qex-wrap">
      <header className="qex-head">
        <h2 className="qex-title">Qwixx Extreme</h2>
        <div className="qex-meta">
          <span className="qex-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="qex-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="qex-die-area">
          <div className="qex-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="qex-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="qex-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-qwixx-extreme-mark"
            key={i}
            className={`qex-cell qex-z${cellZone(i)}${filled ? " qex-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as QwixxExtremeAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="qex-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-qwixx-extreme-roll" className="qex-btn qex-btn-primary" onClick={() => dispatch({ type: "roll" } as QwixxExtremeAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-qwixx-extreme-skip" className="qex-btn qex-btn-skip" onClick={() => dispatch({ type: "skip" } as QwixxExtremeAction)}>Skip</button>
        )}
        <button className="qex-btn qex-btn-reset" onClick={() => dispatch({ type: "reset" } as QwixxExtremeAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="qex-done">Final score: <b>{final}</b></div>
      )}
      <div className="qex-rules">Roll 8 = double points</div>
    </div>
  );
}
