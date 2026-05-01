import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CleverDiceState, CleverDiceAction, CleverDiceSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#f1c40f","#1f618d","#196f3d","#a93226"];

export function CleverDiceGame({ state, dispatch, onGameOver }: GameProps<CleverDiceState, CleverDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="cdc-wrap">
      <header className="cdc-head">
        <h2 className="cdc-title">Clever Dice</h2>
        <div className="cdc-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="cdc-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="cdc-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`cdc-die${state.selectedDie === i ? " cdc-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as CleverDiceAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="cdc-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="cdc-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="cdc-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`cdc-cell${isFilled ? " cdc-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="cdc-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as CleverDiceAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="cdc-controls">
        {state.phase === "rolling" && (
          <button className="cdc-btn cdc-primary" onClick={() => dispatch({ type: "roll" } as CleverDiceAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="cdc-btn cdc-skip" onClick={() => dispatch({ type: "skip" } as CleverDiceAction)}>Skip</button>
        )}
        <button className="cdc-btn cdc-reset" onClick={() => dispatch({ type: "reset" } as CleverDiceAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="cdc-done">Final: <b>{final}</b></div>}
      <div className="cdc-rules">Yellow track: +1 each, all = +5</div>
    </div>
  );
}
