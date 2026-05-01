import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeMoonState, WelcomeMoonAction, WelcomeMoonSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function WelcomeMoonGame({ state, dispatch, onGameOver }: GameProps<WelcomeMoonState, WelcomeMoonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="wmn-wrap">
      <header className="wmn-head">
        <h2 className="wmn-title">Welcome to the Moon</h2>
        <div className="wmn-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wmn-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="wmn-die-area">
          <div className="wmn-die">{state.lastRoll}</div>
          <div className="wmn-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="wmn-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="wmn-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button
                  key={c}
                  className={`wmn-slot${val !== null ? " wmn-filled" : ""}${canPlace ? " wmn-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as WelcomeMoonAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wmn-controls">
        {state.phase === "rolling" && (
          <button className="wmn-btn wmn-primary" onClick={() => dispatch({ type: "roll" } as WelcomeMoonAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button className="wmn-btn wmn-skip" onClick={() => dispatch({ type: "skip" } as WelcomeMoonAction)}>Skip (−1)</button>
        )}
        <button className="wmn-btn wmn-reset" onClick={() => dispatch({ type: "reset" } as WelcomeMoonAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="wmn-done">Final: <b>{final}</b></div>}
      <div className="wmn-rules">Lunar bases: pairs of 11 grant +5</div>
    </div>
  );
}
