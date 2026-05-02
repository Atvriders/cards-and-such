import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxConnectedState, QwixxConnectedAction, QwixxConnectedSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function QwixxConnectedGame({ state, dispatch, onGameOver }: GameProps<QwixxConnectedState, QwixxConnectedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="qcn-wrap">
      <header className="qcn-head">
        <h2 className="qcn-title">Qwixx Connected</h2>
        <div className="qcn-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="qcn-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="qcn-die-area">
          <div className="qcn-die">{state.lastRoll}</div>
          <div className="qcn-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="qcn-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="qcn-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button data-testid="hint-target-qwixx-connected-place"
                  key={c}
                  className={`qcn-slot${val !== null ? " qcn-filled" : ""}${canPlace ? " qcn-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as QwixxConnectedAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="qcn-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-qwixx-connected-roll" className="qcn-btn qcn-primary" onClick={() => dispatch({ type: "roll" } as QwixxConnectedAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button data-testid="hint-target-qwixx-connected-skip" className="qcn-btn qcn-skip" onClick={() => dispatch({ type: "skip" } as QwixxConnectedAction)}>Skip (−1)</button>
        )}
        <button className="qcn-btn qcn-reset" onClick={() => dispatch({ type: "reset" } as QwixxConnectedAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="qcn-done">Final: <b>{final}</b></div>}
      <div className="qcn-rules">Strictly increasing chain</div>
    </div>
  );
}
