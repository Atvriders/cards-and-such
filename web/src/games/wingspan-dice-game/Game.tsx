import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WingspanDiceGameState, WingspanDiceGameAction, WingspanDiceGameSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#52be80","#f1c40f","#a04000","#5d6d7e"];

export function WingspanDiceGameGame({ state, dispatch, onGameOver }: GameProps<WingspanDiceGameState, WingspanDiceGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="wsd-wrap">
      <header className="wsd-head">
        <h2 className="wsd-title">Wingspan Dice Game</h2>
        <div className="wsd-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="wsd-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="wsd-dice">
          {state.lastDice.map((v, i) => (
            <button data-testid="hint-target-wingspan-dice-game-pick"
              key={i}
              className={`wsd-die${state.selectedDie === i ? " wsd-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as WingspanDiceGameAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="wsd-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="wsd-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="wsd-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`wsd-cell${isFilled ? " wsd-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button data-testid="hint-target-wingspan-dice-game-place"
                className="wsd-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as WingspanDiceGameAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="wsd-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-wingspan-dice-game-roll" className="wsd-btn wsd-primary" onClick={() => dispatch({ type: "roll" } as WingspanDiceGameAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button data-testid="hint-target-wingspan-dice-game-skip" className="wsd-btn wsd-skip" onClick={() => dispatch({ type: "skip" } as WingspanDiceGameAction)}>Skip</button>
        )}
        <button className="wsd-btn wsd-reset" onClick={() => dispatch({ type: "reset" } as WingspanDiceGameAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="wsd-done">Final: <b>{final}</b></div>}
      <div className="wsd-rules">Each filled habitat: +bird bonus</div>
    </div>
  );
}
