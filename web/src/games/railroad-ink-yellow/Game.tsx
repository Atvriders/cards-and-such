import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkYellowState, RailroadInkYellowAction, RailroadInkYellowSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkYellowGame({ state, dispatch, onGameOver }: GameProps<RailroadInkYellowState, RailroadInkYellowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="riy-wrap">
      <header className="riy-head">
        <h2 className="riy-title">Railroad Ink Yellow</h2>
        <div className="riy-meta">
          <span className="riy-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="riy-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="riy-die-area">
          <div className="riy-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="riy-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="riy-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`riy-cell riy-z${cellZone(i)}${filled ? " riy-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkYellowAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="riy-controls">
        {state.phase === "rolling" && (
          <button className="riy-btn riy-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkYellowAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="riy-btn riy-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkYellowAction)}>Skip</button>
        )}
        <button className="riy-btn riy-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkYellowAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="riy-done">Final score: <b>{final}</b></div>
      )}
      <div className="riy-rules">Each odd roll: +1 oasis bonus</div>
    </div>
  );
}
