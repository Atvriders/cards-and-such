import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GanzCleverState, GanzCleverAction, GanzCleverSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#f1c40f","#f39c12","#d35400","#a04000"];

export function GanzCleverGame({ state, dispatch, onGameOver }: GameProps<GanzCleverState, GanzCleverSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="gcl-wrap">
      <header className="gcl-head">
        <h2 className="gcl-title">Ganz Clever</h2>
        <div className="gcl-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="gcl-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="gcl-dice">
          {state.lastDice.map((v, i) => (
            <button
              key={i}
              className={`gcl-die${state.selectedDie === i ? " gcl-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as GanzCleverAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="gcl-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="gcl-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="gcl-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`gcl-cell${isFilled ? " gcl-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button
                className="gcl-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as GanzCleverAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="gcl-controls">
        {state.phase === "rolling" && (
          <button className="gcl-btn gcl-primary" onClick={() => dispatch({ type: "roll" } as GanzCleverAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button className="gcl-btn gcl-skip" onClick={() => dispatch({ type: "skip" } as GanzCleverAction)}>Skip</button>
        )}
        <button className="gcl-btn gcl-reset" onClick={() => dispatch({ type: "reset" } as GanzCleverAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="gcl-done">Final: <b>{final}</b></div>}
      <div className="gcl-rules">Each die: pick track, sum the rest</div>
    </div>
  );
}
