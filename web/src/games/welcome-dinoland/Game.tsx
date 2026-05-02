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
    <div className="wdino-wrap">
      <header className="wdino-head">
        <h2 className="wdino-title">Welcome to Dinoland</h2>
        <div className="wdino-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wdino-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wdino-die-area">
          <div className="wdino-die">{state.lastRoll}</div>
          <div className="wdino-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wdino-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wdino-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-dinoland-place"
                  key={c}
                  className={`wdino-slot${val !== null ? " wdino-filled" : ""}${canPlace ? " wdino-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeDinolandAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wdino-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-dinoland-roll" className="wdino-btn wdino-primary" onClick={() => dispatch({ type: "roll" } as WelcomeDinolandAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-dinoland-skip" className="wdino-btn wdino-skip" onClick={() => dispatch({ type: "skip" } as WelcomeDinolandAction)}>Skip (−1)</button>
        )}
        <button className="wdino-btn wdino-reset" onClick={() => dispatch({ type: "reset" } as WelcomeDinolandAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wdino-done">Final: <b>{final}</b></div>}
      <div className="wdino-rules">Roll of 1 = fossil = +5 special</div>
    </div>
  );
}
