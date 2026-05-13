import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToSuburbState, WelcomeToSuburbAction, WelcomeToSuburbSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeToSuburbGame({ state, dispatch, onGameOver }: GameProps<WelcomeToSuburbState, WelcomeToSuburbSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wts-wrap fade-in">
      <header className="wts-head">
        <h2 className="wts-title">Welcome To Suburb</h2>
        <div className="wts-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wts-score pulse">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wts-die-area">
          <div className="wts-die">{state.lastRoll}</div>
          <div className="wts-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wts-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wts-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-to-suburb-place"
                  key={c}
                  className={`wts-slot${val !== null ? " wts-filled" : ""}${canPlace ? " wts-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeToSuburbAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wts-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-to-suburb-roll" className="wts-btn wts-primary" onClick={() => dispatch({ type: "roll" } as WelcomeToSuburbAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-to-suburb-skip" className="wts-btn wts-skip" onClick={() => dispatch({ type: "skip" } as WelcomeToSuburbAction)}>Skip (−1)</button>
        )}
        <button className="wts-btn wts-reset" onClick={() => dispatch({ type: "reset" } as WelcomeToSuburbAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wts-done bounce-in">Final: <b>{final}</b></div>}
      <div className="wts-rules">Each pair of consecutive houses: +2</div>
    </div>
  );
}
