import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RailroadInkChallengeState, RailroadInkChallengeAction, RailroadInkChallengeSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function RailroadInkChallengeGame({ state, dispatch, onGameOver }: GameProps<RailroadInkChallengeState, RailroadInkChallengeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="ric-wrap">
      <header className="ric-head">
        <h2 className="ric-title">Railroad Ink Challenge</h2>
        <div className="ric-meta">
          <span className="ric-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ric-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="ric-die-area">
          <div className="ric-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="ric-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="ric-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`ric-cell ric-z${cellZone(i)}${filled ? " ric-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as RailroadInkChallengeAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="ric-controls">
        {state.phase === "rolling" && (
          <button className="ric-btn ric-btn-primary" onClick={() => dispatch({ type: "roll" } as RailroadInkChallengeAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="ric-btn ric-btn-skip" onClick={() => dispatch({ type: "skip" } as RailroadInkChallengeAction)}>Skip</button>
        )}
        <button className="ric-btn ric-btn-reset" onClick={() => dispatch({ type: "reset" } as RailroadInkChallengeAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="ric-done">Final score: <b>{final}</b></div>
      )}
      <div className="ric-rules">Endurance: penalty −2 if any row empty</div>
    </div>
  );
}
