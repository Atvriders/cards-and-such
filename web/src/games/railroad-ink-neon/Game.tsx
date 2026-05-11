import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkNeonState, RailroadInkNeonAction, RailroadInkNeonSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkNeonGame({ state, dispatch, onGameOver }: GameProps<RailroadInkNeonState, RailroadInkNeonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="rin-wrap">
      <header className="rin-head">
        <h2 className="rin-title">Railroad Ink Neon</h2>
        <div className="rin-meta">
          <span className="rin-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rin-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="rin-die-area">
          <div className="rin-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="rin-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="rin-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-railroad-ink-neon-mark"
            key={i}
            className={`rin-cell rin-z${cellZone(i)}${filled ? " rin-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkNeonAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="rin-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-railroad-ink-neon-roll" className="rin-btn rin-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkNeonAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-railroad-ink-neon-skip" className="rin-btn rin-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkNeonAction)}>Skip</button>
        )}
        <button className="rin-btn rin-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkNeonAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="rin-done">Final score: <b>{final}</b></div>
      )}
      <div className="rin-rules">Dark mode: bonus when 4+ rolls match a color</div>
    </div>
  );
}
