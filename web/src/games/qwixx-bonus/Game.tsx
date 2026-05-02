import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxBonusState, QwixxBonusAction, QwixxBonusSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function QwixxBonusGame({ state, dispatch, onGameOver }: GameProps<QwixxBonusState, QwixxBonusSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="qbn-wrap">
      <header className="qbn-head">
        <h2 className="qbn-title">Qwixx Bonus</h2>
        <div className="qbn-meta">
          <span className="qbn-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="qbn-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="qbn-die-area">
          <div className="qbn-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="qbn-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="qbn-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-qwixx-bonus-mark"
            key={i}
            className={`qbn-cell qbn-z${cellZone(i)}${filled ? " qbn-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as QwixxBonusAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="qbn-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-qwixx-bonus-roll" className="qbn-btn qbn-btn-primary" onClick={() => dispatch({ type: "roll" } as QwixxBonusAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-qwixx-bonus-skip" className="qbn-btn qbn-btn-skip" onClick={() => dispatch({ type: "skip" } as QwixxBonusAction)}>Skip</button>
        )}
        <button className="qbn-btn qbn-btn-reset" onClick={() => dispatch({ type: "reset" } as QwixxBonusAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="qbn-done">Final score: <b>{final}</b></div>
      )}
      <div className="qbn-rules">Two of same value = +5 bonus</div>
    </div>
  );
}
