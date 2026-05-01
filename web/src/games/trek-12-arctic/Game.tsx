import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Trek12ArcticState, Trek12ArcticAction, Trek12ArcticSettings } from "./state.js";
import { isTerminal, NODE_COUNT, TOTAL_ROLLS, applyOp } from "./state.js";
import "./Game.css";

type Op = "sum" | "diff" | "max" | "min";

export function Trek12ArcticGame({ state, dispatch, onGameOver }: GameProps<Trek12ArcticState, Trek12ArcticSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [op, setOp] = useState<Op>("sum");
  const final = t?.score ?? state.score;
  const preview = state.lastDice ? applyOp(state.lastDice[0], state.lastDice[1], op) : null;

  return (
    <div className="tar-wrap">
      <header className="tar-head">
        <h2 className="tar-title">Trek 12 Arctic</h2>
        <div className="tar-meta">
          <span>Roll {state.rolls + (state.phase === "choosing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="tar-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice && (
        <div className="tar-dice-area">
          <div className="tar-die">{state.lastDice[0]}</div>
          <div className="tar-die">{state.lastDice[1]}</div>
          <div className="tar-ops">
            {(["sum", "diff", "max", "min"] as Op[]).map(o => (
              <button key={o} className={`tar-op${op === o ? " tar-op-on" : ""}`} onClick={() => setOp(o)}>{o}</button>
            ))}
          </div>
          {preview !== null && <div className="tar-preview">= <b>{preview}</b></div>}
        </div>
      )}

      <div className="tar-chain">
        {Array.from({ length: NODE_COUNT }).map((_, i) => {
          const v = state.values[i];
          const canPlace = state.phase === "choosing" && v === null;
          return (
            <button
              key={i}
              className={`tar-node${v !== null ? " tar-on" : ""}${canPlace ? " tar-legal" : ""}`}
              disabled={!canPlace}
              onClick={() => dispatch({ type: "place", index: i, op } as Trek12ArcticAction)}
            >{v ?? i + 1}</button>
          );
        })}
      </div>

      <div className="tar-controls">
        {state.phase === "rolling" && <button className="tar-btn tar-primary" onClick={() => dispatch({ type: "roll" } as Trek12ArcticAction)}>Roll 2 Dice</button>}
        {state.phase === "choosing" && <button className="tar-btn tar-skip" onClick={() => dispatch({ type: "skip" } as Trek12ArcticAction)}>Skip</button>}
        <button className="tar-btn tar-reset" onClick={() => dispatch({ type: "reset" } as Trek12ArcticAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="tar-done">Final: <b>{final}</b></div>}
      <div className="tar-rules">All ≤3 rolls: ice bonus +5</div>
    </div>
  );
}
