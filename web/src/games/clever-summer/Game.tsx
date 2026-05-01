import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CleverSummerState, CleverSummerAction, CleverSummerSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#fff59d","#fff176","#ffeb3b","#fbc02d"];

export function CleverSummerGame({ state, dispatch, onGameOver }: GameProps<CleverSummerState, CleverSummerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="csu-wrap">
      <header className="csu-head">
        <h2 className="csu-title">Clever Summer</h2>
        <div className="csu-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="csu-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="csu-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`csu-die${state.selectedDie === i ? " csu-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as CleverSummerAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="csu-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="csu-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="csu-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`csu-cell${isFilled ? " csu-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="csu-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as CleverSummerAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="csu-controls">
        {state.phase === "rolling" && (
          <button className="csu-btn csu-primary" onClick={() => dispatch({ type: "roll" } as CleverSummerAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="csu-btn csu-skip" onClick={() => dispatch({ type: "skip" } as CleverSummerAction)}>Skip</button>
        )}
        <button className="csu-btn csu-reset" onClick={() => dispatch({ type: "reset" } as CleverSummerAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="csu-done">Final: <b>{final}</b></div>}
      <div className="csu-rules">Pair of 6: +sun multiplier 2x</div>
    </div>
  );
}
