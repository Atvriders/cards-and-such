import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkBlueState, RailroadInkBlueAction, RailroadInkBlueSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkBlueGame({ state, dispatch, onGameOver }: GameProps<RailroadInkBlueState, RailroadInkBlueSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="rib-wrap">
      <header className="rib-head">
        <h2 className="rib-title">Railroad Ink Blue</h2>
        <div className="rib-meta">
          <span className="rib-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rib-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="rib-die-area">
          <div className="rib-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="rib-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="rib-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-railroad-ink-blue-mark"
            key={i}
            className={`rib-cell rib-z${cellZone(i)}${filled ? " rib-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkBlueAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="rib-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-railroad-ink-blue-roll" className="rib-btn rib-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkBlueAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-railroad-ink-blue-skip" className="rib-btn rib-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkBlueAction)}>Skip</button>
        )}
        <button className="rib-btn rib-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkBlueAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="rib-done">Final score: <b>{final}</b></div>
      )}
      <div className="rib-rules">Rivers: +2 each connected cell</div>
    </div>
  );
}
