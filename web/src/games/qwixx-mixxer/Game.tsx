import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxMixxerState, QwixxMixxerAction, QwixxMixxerSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#e74c3c","#f1c40f","#27ae60","#3498db"];

export function QwixxMixxerGame({ state, dispatch, onGameOver }: GameProps<QwixxMixxerState, QwixxMixxerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="qmx-wrap">
      <header className="qmx-head">
        <h2 className="qmx-title">Qwixx MixXxer</h2>
        <div className="qmx-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="qmx-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="qmx-dice">
          {state.lastDice.map((v, i) => (
            <button data-testid="hint-target-qwixx-mixxer-pick"
              key={i}
              className={`qmx-die${state.selectedDie === i ? " qmx-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as QwixxMixxerAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="qmx-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="qmx-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="qmx-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`qmx-cell${isFilled ? " qmx-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button data-testid="hint-target-qwixx-mixxer-place"
                className="qmx-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as QwixxMixxerAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="qmx-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-qwixx-mixxer-roll" className="qmx-btn qmx-primary" onClick={() => dispatch({ type: "roll" } as QwixxMixxerAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button data-testid="hint-target-qwixx-mixxer-skip" className="qmx-btn qmx-skip" onClick={() => dispatch({ type: "skip" } as QwixxMixxerAction)}>Skip</button>
        )}
        <button className="qmx-btn qmx-reset" onClick={() => dispatch({ type: "reset" } as QwixxMixxerAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="qmx-done">Final: <b>{final}</b></div>}
      <div className="qmx-rules">5-dice scorer with 4-color tracks</div>
    </div>
  );
}
