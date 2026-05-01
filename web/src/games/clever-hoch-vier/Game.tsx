import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CleverHochVierState, CleverHochVierAction, CleverHochVierSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#bb8fce","#a569bd","#884ea0","#5b2c6f"];

export function CleverHochVierGame({ state, dispatch, onGameOver }: GameProps<CleverHochVierState, CleverHochVierSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="chv-wrap">
      <header className="chv-head">
        <h2 className="chv-title">Clever Hoch Vier</h2>
        <div className="chv-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="chv-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="chv-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`chv-die${state.selectedDie === i ? " chv-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as CleverHochVierAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="chv-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="chv-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="chv-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`chv-cell${isFilled ? " chv-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="chv-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as CleverHochVierAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="chv-controls">
        {state.phase === "rolling" && (
          <button className="chv-btn chv-primary" onClick={() => dispatch({ type: "roll" } as CleverHochVierAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="chv-btn chv-skip" onClick={() => dispatch({ type: "skip" } as CleverHochVierAction)}>Skip</button>
        )}
        <button className="chv-btn chv-reset" onClick={() => dispatch({ type: "reset" } as CleverHochVierAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="chv-done">Final: <b>{final}</b></div>}
      <div className="chv-rules">4-of-a-kind: +10 bonus</div>
    </div>
  );
}
