import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoppeltCleverState, DoppeltCleverAction, DoppeltCleverSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#aed6f1","#5dade2","#3498db","#21618c"];

export function DoppeltCleverGame({ state, dispatch, onGameOver }: GameProps<DoppeltCleverState, DoppeltCleverSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="dcl-wrap">
      <header className="dcl-head">
        <h2 className="dcl-title">Doppelt Clever</h2>
        <div className="dcl-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="dcl-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="dcl-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`dcl-die${state.selectedDie === i ? " dcl-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as DoppeltCleverAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="dcl-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="dcl-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="dcl-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`dcl-cell${isFilled ? " dcl-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="dcl-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as DoppeltCleverAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="dcl-controls">
        {state.phase === "rolling" && (
          <button className="dcl-btn dcl-primary" onClick={() => dispatch({ type: "roll" } as DoppeltCleverAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="dcl-btn dcl-skip" onClick={() => dispatch({ type: "skip" } as DoppeltCleverAction)}>Skip</button>
        )}
        <button className="dcl-btn dcl-reset" onClick={() => dispatch({ type: "reset" } as DoppeltCleverAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="dcl-done">Final: <b>{final}</b></div>}
      <div className="dcl-rules">Pair bonuses on consecutive rounds</div>
    </div>
  );
}
