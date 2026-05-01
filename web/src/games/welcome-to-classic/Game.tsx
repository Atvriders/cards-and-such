import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToClassicState, WelcomeToClassicAction, WelcomeToClassicSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeToClassicGame({ state, dispatch, onGameOver }: GameProps<WelcomeToClassicState, WelcomeToClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wtc-wrap">
      <header className="wtc-head">
        <h2 className="wtc-title">Welcome To Classic</h2>
        <div className="wtc-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wtc-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wtc-die-area">
          <div className="wtc-die">{state.lastRoll}</div>
          <div className="wtc-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wtc-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wtc-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button
                  key={c}
                  className={`wtc-slot${val !== null ? " wtc-filled" : ""}${canPlace ? " wtc-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeToClassicAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wtc-controls">
        {state.phase === "rolling" && (
          <button className="wtc-btn wtc-primary" onClick={() => dispatch({ type: "roll" } as WelcomeToClassicAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button className="wtc-btn wtc-skip" onClick={() => dispatch({ type: "skip" } as WelcomeToClassicAction)}>Skip (−1)</button>
        )}
        <button className="wtc-btn wtc-reset" onClick={() => dispatch({ type: "reset" } as WelcomeToClassicAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wtc-done">Final: <b>{final}</b></div>}
      <div className="wtc-rules">Houses must be ascending — skips score</div>
    </div>
  );
}
