import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToWinterState, WelcomeToWinterAction, WelcomeToWinterSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeToWinterGame({ state, dispatch, onGameOver }: GameProps<WelcomeToWinterState, WelcomeToWinterSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wwi-wrap">
      <header className="wwi-head">
        <h2 className="wwi-title">Welcome To Winter</h2>
        <div className="wwi-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wwi-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wwi-die-area">
          <div className="wwi-die">{state.lastRoll}</div>
          <div className="wwi-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wwi-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wwi-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-to-winter-place"
                  key={c}
                  className={`wwi-slot${val !== null ? " wwi-filled" : ""}${canPlace ? " wwi-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeToWinterAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wwi-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-to-winter-roll" className="wwi-btn wwi-primary" onClick={() => dispatch({ type: "roll" } as WelcomeToWinterAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-to-winter-skip" className="wwi-btn wwi-skip" onClick={() => dispatch({ type: "skip" } as WelcomeToWinterAction)}>Skip (−1)</button>
        )}
        <button className="wwi-btn wwi-reset" onClick={() => dispatch({ type: "reset" } as WelcomeToWinterAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wwi-done">Final: <b>{final}</b></div>}
      <div className="wwi-rules">Three odd in a row: +blizzard 6</div>
    </div>
  );
}
