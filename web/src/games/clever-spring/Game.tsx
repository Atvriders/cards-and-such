import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CleverSpringState, CleverSpringAction, CleverSpringSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#f8bbd0","#f48fb1","#f06292","#ec407a"];

export function CleverSpringGame({ state, dispatch, onGameOver }: GameProps<CleverSpringState, CleverSpringSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="cspr-wrap">
      <header className="cspr-head">
        <h2 className="cspr-title">Clever Spring</h2>
        <div className="cspr-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="cspr-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="cspr-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`cspr-die${state.selectedDie === i ? " cspr-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as CleverSpringAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="cspr-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="cspr-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="cspr-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`cspr-cell${isFilled ? " cspr-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="cspr-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as CleverSpringAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="cspr-controls">
        {state.phase === "rolling" && (
          <button className="cspr-btn cspr-primary" onClick={() => dispatch({ type: "roll" } as CleverSpringAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="cspr-btn cspr-skip" onClick={() => dispatch({ type: "skip" } as CleverSpringAction)}>Skip</button>
        )}
        <button className="cspr-btn cspr-reset" onClick={() => dispatch({ type: "reset" } as CleverSpringAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="cspr-done">Final: <b>{final}</b></div>}
      <div className="cspr-rules">Rolls 6: bloom bonus +4</div>
    </div>
  );
}
