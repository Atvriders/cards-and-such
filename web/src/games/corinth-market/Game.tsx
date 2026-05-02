import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CorinthMarketState, CorinthMarketAction, CorinthMarketSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CorinthMarketGame({ state, dispatch, onGameOver }: GameProps<CorinthMarketState, CorinthMarketSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="com-wrap">
      <header className="com-head">
        <h2 className="com-title">Corinth Market</h2>
        <div className="com-meta">
          <span className="com-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="com-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="com-die-area">
          <div className="com-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="com-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="com-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-corinth-market-mark"
            key={i}
            className={`com-cell com-z${cellZone(i)}${filled ? " com-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as CorinthMarketAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="com-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-corinth-market-roll" className="com-btn com-btn-primary" onClick={() => dispatch({ type: "roll" } as CorinthMarketAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-corinth-market-skip" className="com-btn com-btn-skip" onClick={() => dispatch({ type: "skip" } as CorinthMarketAction)}>Skip</button>
        )}
        <button className="com-btn com-btn-reset" onClick={() => dispatch({ type: "reset" } as CorinthMarketAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="com-done">Final score: <b>{final}</b></div>
      )}
      <div className="com-rules">Column of same value: +pyramid bonus</div>
    </div>
  );
}
