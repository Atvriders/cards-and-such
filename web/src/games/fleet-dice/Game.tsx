import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FleetDiceState, FleetDiceAction, FleetDiceSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#aed6f1","#5dade2","#3498db","#1f618d"];

export function FleetDiceGame({ state, dispatch, onGameOver }: GameProps<FleetDiceState, FleetDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="fld-wrap">
      <header className="fld-head">
        <h2 className="fld-title">Fleet Dice</h2>
        <div className="fld-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="fld-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="fld-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`fld-die${state.selectedDie === i ? " fld-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as FleetDiceAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="fld-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="fld-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="fld-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`fld-cell${isFilled ? " fld-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="fld-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as FleetDiceAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="fld-controls">
        {state.phase === "rolling" && (
          <button className="fld-btn fld-primary" onClick={() => dispatch({ type: "roll" } as FleetDiceAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="fld-btn fld-skip" onClick={() => dispatch({ type: "skip" } as FleetDiceAction)}>Skip</button>
        )}
        <button className="fld-btn fld-reset" onClick={() => dispatch({ type: "reset" } as FleetDiceAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="fld-done">Final: <b>{final}</b></div>}
      <div className="fld-rules">Boat + fish + crew: full ship bonus</div>
    </div>
  );
}
