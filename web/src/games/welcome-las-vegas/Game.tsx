import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeLasVegasState, WelcomeLasVegasAction, WelcomeLasVegasSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeLasVegasGame({ state, dispatch, onGameOver }: GameProps<WelcomeLasVegasState, WelcomeLasVegasSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wlv-wrap">
      <header className="wlv-head">
        <h2 className="wlv-title">Welcome to Las Vegas</h2>
        <div className="wlv-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wlv-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wlv-die-area">
          <div className="wlv-die">{state.lastRoll}</div>
          <div className="wlv-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wlv-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wlv-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-welcome-las-vegas-place"
                  key={c}
                  className={`wlv-slot${val !== null ? " wlv-filled" : ""}${canPlace ? " wlv-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeLasVegasAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wlv-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-welcome-las-vegas-roll" className="wlv-btn wlv-primary" onClick={() => dispatch({ type: "roll" } as WelcomeLasVegasAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-welcome-las-vegas-skip" className="wlv-btn wlv-skip" onClick={() => dispatch({ type: "skip" } as WelcomeLasVegasAction)}>Skip (−1)</button>
        )}
        <button className="wlv-btn wlv-reset" onClick={() => dispatch({ type: "reset" } as WelcomeLasVegasAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wlv-done">Final: <b>{final}</b></div>}
      <div className="wlv-rules">Roll 12 = jackpot +10</div>
    </div>
  );
}
