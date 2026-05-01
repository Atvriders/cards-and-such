import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OnTourRoadsState, OnTourRoadsAction, OnTourRoadsSettings } from "./state.js";
import { isTerminal, ROW_COUNT, ROW_LEN, TOTAL_ROLLS, legalAt } from "./state.js";
import "./Game.css";

export function OnTourRoadsGame({ state, dispatch, onGameOver }: GameProps<OnTourRoadsState, OnTourRoadsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="otr-wrap">
      <header className="otr-head">
        <h2 className="otr-title">On Tour Roads</h2>
        <div className="otr-meta">
          <span>Roll {state.rolls + (state.phase === "placing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="otr-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "placing" && state.lastRoll !== null && (
        <div className="otr-die-area">
          <div className="otr-die">{state.lastRoll}</div>
          <div className="otr-hint">Place this number into a row, keeping each row strictly ascending.</div>
        </div>
      )}
      <div className="otr-board">
        {Array.from({ length: ROW_COUNT }).map((_, r) => (
          <div key={r} className="otr-row">
            {Array.from({ length: ROW_LEN }).map((__, c) => {
              const idx = r * ROW_LEN + c;
              const val = state.values[idx];
              const canPlace = state.phase === "placing" && state.lastRoll !== null && legalAt(state.values, idx, state.lastRoll);
              return (
                <button
                  key={c}
                  className={`otr-slot${val !== null ? " otr-filled" : ""}${canPlace ? " otr-legal" : ""}`}
                  disabled={val !== null || !canPlace}
                  onClick={() => dispatch({ type: "place", index: idx } as OnTourRoadsAction)}
                >{val ?? ""}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="otr-controls">
        {state.phase === "rolling" && (
          <button className="otr-btn otr-primary" onClick={() => dispatch({ type: "roll" } as OnTourRoadsAction)}>Roll</button>
        )}
        {state.phase === "placing" && (
          <button className="otr-btn otr-skip" onClick={() => dispatch({ type: "skip" } as OnTourRoadsAction)}>Skip (−1)</button>
        )}
        <button className="otr-btn otr-reset" onClick={() => dispatch({ type: "reset" } as OnTourRoadsAction)}>Reset</button>
      </div>
      {state.phase === "done" && <div className="otr-done">Final: <b>{final}</b></div>}
      <div className="otr-rules">Longest ascending chain rewarded</div>
    </div>
  );
}
