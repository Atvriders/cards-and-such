import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkGreenState, RailroadInkGreenAction, RailroadInkGreenSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkGreenGame({ state, dispatch, onGameOver }: GameProps<RailroadInkGreenState, RailroadInkGreenSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="rig-wrap">
      <header className="rig-head">
        <h2 className="rig-title">Railroad Ink Green</h2>
        <div className="rig-meta">
          <span className="rig-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rig-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="rig-die-area">
          <div className="rig-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="rig-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="rig-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-railroad-ink-green-mark"
            key={i}
            className={`rig-cell rig-z${cellZone(i)}${filled ? " rig-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkGreenAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="rig-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-railroad-ink-green-roll" className="rig-btn rig-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkGreenAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-railroad-ink-green-skip" className="rig-btn rig-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkGreenAction)}>Skip</button>
        )}
        <button className="rig-btn rig-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkGreenAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="rig-done">Final score: <b>{final}</b></div>
      )}
      <div className="rig-rules">Bridge: 6+6 = +5 bonus</div>
    </div>
  );
}
