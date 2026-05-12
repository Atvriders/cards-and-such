import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToSpringState, WelcomeToSpringAction, WelcomeToSpringSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeToSpringGame({ state, dispatch, onGameOver }: GameProps<WelcomeToSpringState, WelcomeToSpringSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wsp-wrap">
      <header className="wsp-head">
        <h2 className="wsp-title">Welcome To Spring</h2>
        <div className="wsp-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wsp-score pulse">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wsp-die-area">
          <div className="wsp-die">{state.lastRoll}</div>
          <div className="wsp-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wsp-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wsp-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-to-spring-place"
                  key={c}
                  className={`wsp-slot${val !== null ? " wsp-filled" : ""}${canPlace ? " wsp-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeToSpringAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wsp-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-to-spring-roll" className="wsp-btn wsp-primary" onClick={() => dispatch({ type: "roll" } as WelcomeToSpringAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-to-spring-skip" className="wsp-btn wsp-skip" onClick={() => dispatch({ type: "skip" } as WelcomeToSpringAction)}>Skip (−1)</button>
        )}
        <button className="wsp-btn wsp-reset" onClick={() => dispatch({ type: "reset" } as WelcomeToSpringAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wsp-done bounce-in">Final: <b>{final}</b></div>}
      <div className="wsp-rules">Each consecutive pair: +flower</div>
    </div>
  );
}
