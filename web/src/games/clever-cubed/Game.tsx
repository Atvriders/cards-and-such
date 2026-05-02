import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CleverCubedState, CleverCubedAction, CleverCubedSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#76d7c4","#48c9b0","#1abc9c","#16a085"];

export function CleverCubedGame({ state, dispatch, onGameOver }: GameProps<CleverCubedState, CleverCubedSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="ccu-wrap">
      <header className="ccu-head">
        <h2 className="ccu-title">Clever Cubed</h2>
        <div className="ccu-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="ccu-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="ccu-dice">
          {state.lastDice.map((v, i) => (
            <button data-testid="hint-target-clever-cubed-pick"
              key={i}
              className={`ccu-die${state.selectedDie === i ? " ccu-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as CleverCubedAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="ccu-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="ccu-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="ccu-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`ccu-cell${isFilled ? " ccu-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button data-testid="hint-target-clever-cubed-place"
                className="ccu-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as CleverCubedAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="ccu-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-clever-cubed-roll" className="ccu-btn ccu-primary" onClick={() => dispatch({ type: "roll" } as CleverCubedAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button data-testid="hint-target-clever-cubed-skip" className="ccu-btn ccu-skip" onClick={() => dispatch({ type: "skip" } as CleverCubedAction)}>Skip</button>
        )}
        <button className="ccu-btn ccu-reset" onClick={() => dispatch({ type: "reset" } as CleverCubedAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="ccu-done">Final: <b>{final}</b></div>}
      <div className="ccu-rules">Cube of count = bonus</div>
    </div>
  );
}
