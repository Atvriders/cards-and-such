import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeDinolandState, WelcomeDinolandAction, WelcomeDinolandSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeDinolandGame({ state, dispatch, onGameOver }: GameProps<WelcomeDinolandState, WelcomeDinolandSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wdl-wrap">
      <header className="wdl-head">
        <h2 className="wdl-title">Welcome to Dinoland</h2>
        <div className="wdl-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wdl-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wdl-die-area">
          <div className="wdl-die">{state.lastRoll}</div>
          <div className="wdl-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wdl-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wdl-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button
                  key={c}
                  className={`wdl-slot${val !== null ? " wdl-filled" : ""}${canPlace ? " wdl-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeDinolandAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wdl-controls">
        {state.phase === "rolling" && (
          <button className="wdl-btn wdl-primary" onClick={() => dispatch({ type: "roll" } as WelcomeDinolandAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button className="wdl-btn wdl-skip" onClick={() => dispatch({ type: "skip" } as WelcomeDinolandAction)}>Skip (−1)</button>
        )}
        <button className="wdl-btn wdl-reset" onClick={() => dispatch({ type: "reset" } as WelcomeDinolandAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wdl-done">Final: <b>{final}</b></div>}
      <div className="wdl-rules">Roll of 1 = fossil = +5 special</div>
    </div>
  );
}
