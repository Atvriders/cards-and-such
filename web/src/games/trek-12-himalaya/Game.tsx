import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Trek12HimalayaState, Trek12HimalayaAction, Trek12HimalayaSettings } from "./state.js";
import { isTerminal, NODE_COUNT, TOTAL_ROLLS, applyOp } from "./state.js";
import "./Game.css";

type Op = "sum" | "diff" | "max" | "min";

export function Trek12HimalayaGame({ state, dispatch, onGameOver }: GameProps<Trek12HimalayaState, Trek12HimalayaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [op, setOp] = useState<Op>("sum");
  const final = t?.score ?? state.score;
  const preview = state.lastDice ? applyOp(state.lastDice[0], state.lastDice[1], op) : null;

  return (
    <div className="thi-wrap">
      <header className="thi-head">
        <h2 className="thi-title">Trek 12 Himalaya</h2>
        <div className="thi-meta">
          <span>Roll {state.rolls + (state.phase === "choosing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="thi-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice && (
        <div className="thi-dice-area">
          <div className="thi-die">{state.lastDice[0]}</div>
          <div className="thi-die">{state.lastDice[1]}</div>
          <div className="thi-ops">
            {(["sum", "diff", "max", "min"] as Op[]).map(o => (
              <button key={o} className={`thi-op${op === o ? " thi-op-on" : ""}`} onClick={() => setOp(o)}>{o}</button>
            ))}
          </div>
          {preview !== null && <div className="thi-preview">= <b>{preview}</b></div>}
        </div>
      )}

      <div className="thi-chain">
        {Array.from({ length: NODE_COUNT }).map((_, i) => {
          const v = state.values[i];
          const canPlace = state.phase === "choosing" && v === null;
          return (
            <button data-testid="hint-target-trek-12-himalaya-place"
              key={i}
              className={`thi-node${v !== null ? " thi-on" : ""}${canPlace ? " thi-legal" : ""}`}
              disabled={!canPlace}
              onClick={() => dispatch({ type: "place", index: i, op } as Trek12HimalayaAction)}
            >{v ?? i + 1}</button>
          );
        })}
      </div>

      <div className="thi-controls">
        {state.phase === "rolling" && <button data-testid="hint-target-trek-12-himalaya-roll" className="thi-btn thi-primary" onClick={() => dispatch({ type: "roll" } as Trek12HimalayaAction)}>Roll 2 Dice</button>}
        {state.phase === "choosing" && <button data-testid="hint-target-trek-12-himalaya-skip" className="thi-btn thi-skip" onClick={() => dispatch({ type: "skip" } as Trek12HimalayaAction)}>Skip</button>}
        <button className="thi-btn thi-reset" onClick={() => dispatch({ type: "reset" } as Trek12HimalayaAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="thi-done">Final: <b>{final}</b></div>}
      <div className="thi-rules">Higher results = bonus altitude</div>
    </div>
  );
}
