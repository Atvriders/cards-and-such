import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RajasDiceCharmersState, RajasDiceCharmersAction, RajasDiceCharmersSettings } from "./state.js";
import { isTerminal, TRACK_COUNT, TRACK_LEN, TOTAL_ROLLS, trackProgress } from "./state.js";
import "./Game.css";

const TRACK_COLORS = ["#f1c40f","#a93226","#7d3c98","#16a085"];

export function RajasDiceCharmersGame({ state, dispatch, onGameOver }: GameProps<RajasDiceCharmersState, RajasDiceCharmersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;

  return (
    <div className="rdc-wrap">
      <header className="rdc-head">
        <h2 className="rdc-title">Raja's Dice Charmers</h2>
        <div className="rdc-meta">
          <span>Roll {state.rolls + (state.phase !== "rolling" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="rdc-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice.length > 0 && (
        <div className="rdc-dice">
          {state.lastDice.map((v, i) => (
            <button data-testid="hint-target-rajas-dice-charmers-pick"
              key={i}
              className={`rdc-die${state.selectedDie === i ? " rdc-die-on" : ""}`}
              disabled={state.phase !== "picking"}
              onClick={() => dispatch({ type: "pick", dieIdx: i } as RajasDiceCharmersAction)}
            >{v}</button>
          ))}
        </div>
      )}

      <div className="rdc-tracks">
        {Array.from({ length: TRACK_COUNT }).map((_, t) => {
          const progress = trackProgress(state.filled, t);
          const canPlace = state.phase === "placing" && progress < TRACK_LEN;
          return (
            <div key={t} className="rdc-track" style={{ borderColor: TRACK_COLORS[t] }}>
              <div className="rdc-cells">
                {Array.from({ length: TRACK_LEN }).map((__, c) => {
                  const idx = t * TRACK_LEN + c;
                  const isFilled = state.filled[idx];
                  return (
                    <div key={c} className={`rdc-cell${isFilled ? " rdc-fill" : ""}`} style={{ background: isFilled ? TRACK_COLORS[t] : undefined }}>
                      {isFilled ? state.fillValues[idx] : ""}
                    </div>
                  );
                })}
              </div>
              <button data-testid="hint-target-rajas-dice-charmers-place"
                className="rdc-track-btn"
                disabled={!canPlace}
                onClick={() => dispatch({ type: "place", track: t } as RajasDiceCharmersAction)}
                style={{ background: TRACK_COLORS[t] }}
              >Add to {["A","B","C","D"][t]}</button>
            </div>
          );
        })}
      </div>

      <div className="rdc-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-rajas-dice-charmers-roll" className="rdc-btn rdc-primary" onClick={() => dispatch({ type: "roll" } as RajasDiceCharmersAction)}>Roll 5 Dice</button>
        )}
        {(state.phase === "picking" || state.phase === "placing") && (
          <button data-testid="hint-target-rajas-dice-charmers-skip" className="rdc-btn rdc-skip" onClick={() => dispatch({ type: "skip" } as RajasDiceCharmersAction)}>Skip</button>
        )}
        <button className="rdc-btn rdc-reset" onClick={() => dispatch({ type: "reset" } as RajasDiceCharmersAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="rdc-done">Final: <b>{final}</b></div>}
      <div className="rdc-rules">Charm a snake (3+ in row): +6</div>
    </div>
  );
}
