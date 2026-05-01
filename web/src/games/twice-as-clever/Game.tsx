import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TwiceAsCleverState, TwiceAsCleverAction, TwiceAsCleverSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#85c1e9","#5dade2","#3498db","#1f618d"];

export function TwiceAsCleverGame({ state, dispatch, onGameOver }: GameProps<TwiceAsCleverState, TwiceAsCleverSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="tac-wrap">
      <header className="tac-head">
        <h2 className="tac-title">Twice as Clever</h2>
        <div className="tac-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="tac-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="tac-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`tac-die${state.selectedDie === i ? " tac-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as TwiceAsCleverAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="tac-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="tac-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="tac-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`tac-cell${isFilled ? " tac-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="tac-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as TwiceAsCleverAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="tac-controls">
        {state.phase === "rolling" && (
          <button className="tac-btn tac-primary" onClick={() => dispatch({ type: "roll" } as TwiceAsCleverAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="tac-btn tac-skip" onClick={() => dispatch({ type: "skip" } as TwiceAsCleverAction)}>Skip</button>
        )}
        <button className="tac-btn tac-reset" onClick={() => dispatch({ type: "reset" } as TwiceAsCleverAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="tac-done">Final: <b>{final}</b></div>}
      <div className="tac-rules">Streak of 3 same: +6</div>
    </div>
  );
}
