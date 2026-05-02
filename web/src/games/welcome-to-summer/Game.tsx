import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToSummerState, WelcomeToSummerAction, WelcomeToSummerSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeToSummerGame({ state, dispatch, onGameOver }: GameProps<WelcomeToSummerState, WelcomeToSummerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wsu-wrap">
      <header className="wsu-head">
        <h2 className="wsu-title">Welcome To Summer</h2>
        <div className="wsu-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wsu-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wsu-die-area">
          <div className="wsu-die">{state.lastRoll}</div>
          <div className="wsu-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wsu-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wsu-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-to-summer-place"
                  key={c}
                  className={`wsu-slot${val !== null ? " wsu-filled" : ""}${canPlace ? " wsu-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeToSummerAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wsu-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-to-summer-roll" className="wsu-btn wsu-primary" onClick={() => dispatch({ type: "roll" } as WelcomeToSummerAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-to-summer-skip" className="wsu-btn wsu-skip" onClick={() => dispatch({ type: "skip" } as WelcomeToSummerAction)}>Skip (−1)</button>
        )}
        <button className="wsu-btn wsu-reset" onClick={() => dispatch({ type: "reset" } as WelcomeToSummerAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wsu-done">Final: <b>{final}</b></div>}
      <div className="wsu-rules">Even rolls: +pool bonus</div>
    </div>
  );
}
