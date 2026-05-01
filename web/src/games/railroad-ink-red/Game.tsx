import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkRedState, RailroadInkRedAction, RailroadInkRedSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkRedGame({ state, dispatch, onGameOver }: GameProps<RailroadInkRedState, RailroadInkRedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="rir-wrap">
      <header className="rir-head">
        <h2 className="rir-title">Railroad Ink Red</h2>
        <div className="rir-meta">
          <span className="rir-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rir-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="rir-die-area">
          <div className="rir-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="rir-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="rir-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`rir-cell rir-z${cellZone(i)}${filled ? " rir-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkRedAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="rir-controls">
        {state.phase === "rolling" && (
          <button className="rir-btn rir-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkRedAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="rir-btn rir-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkRedAction)}>Skip</button>
        )}
        <button className="rir-btn rir-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkRedAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="rir-done">Final score: <b>{final}</b></div>
      )}
      <div className="rir-rules">Meteor strikes pay 2x</div>
    </div>
  );
}
