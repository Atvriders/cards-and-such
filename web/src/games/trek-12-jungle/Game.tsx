import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Trek12JungleState, Trek12JungleAction, Trek12JungleSettings } from "./state.js";
import { isTerminal, NODE_COUNT, TOTAL_ROLLS, applyOp } from "./state.js";
import "./Game.css";

type Op = "sum" | "diff" | "max" | "min";

export function Trek12JungleGame({ state, dispatch, onGameOver }: GameProps<Trek12JungleState, Trek12JungleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [op, setOp] = useState<Op>("sum");
  const final = t?.score ?? state.score;
  const preview = state.lastDice ? applyOp(state.lastDice[0], state.lastDice[1], op) : null;

  return (
    <div className="tjg-wrap">
      <header className="tjg-head">
        <h2 className="tjg-title">Trek 12 Jungle</h2>
        <div className="tjg-meta">
          <span>Roll {state.rolls + (state.phase === "choosing" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="tjg-score">{state.score} pts</span>
        </div>
      </header>

      {state.lastDice && (
        <div className="tjg-dice-area">
          <div className="tjg-die">{state.lastDice[0]}</div>
          <div className="tjg-die">{state.lastDice[1]}</div>
          <div className="tjg-ops">
            {(["sum", "diff", "max", "min"] as Op[]).map(o => (
              <button key={o} className={`tjg-op${op === o ? " tjg-op-on" : ""}`} onClick={() => setOp(o)}>{o}</button>
            ))}
          </div>
          {preview !== null && <div className="tjg-preview">= <b>{preview}</b></div>}
        </div>
      )}

      <div className="tjg-chain">
        {Array.from({ length: NODE_COUNT }).map((_, i) => {
          const v = state.values[i];
          const canPlace = state.phase === "choosing" && v === null;
          return (
            <button
              key={i}
              className={`tjg-node${v !== null ? " tjg-on" : ""}${canPlace ? " tjg-legal" : ""}`}
              disabled={!canPlace}
              onClick={() => dispatch({ type: "place", index: i, op } as Trek12JungleAction)}
            >{v ?? i + 1}</button>
          );
        })}
      </div>

      <div className="tjg-controls">
        {state.phase === "rolling" && <button className="tjg-btn tjg-primary" onClick={() => dispatch({ type: "roll" } as Trek12JungleAction)}>Roll 2 Dice</button>}
        {state.phase === "choosing" && <button className="tjg-btn tjg-skip" onClick={() => dispatch({ type: "skip" } as Trek12JungleAction)}>Skip</button>}
        <button className="tjg-btn tjg-reset" onClick={() => dispatch({ type: "reset" } as Trek12JungleAction)}>Reset</button>
      </div>

      {state.phase === "done" && <div className="tjg-done">Final: <b>{final}</b></div>}
      <div className="tjg-rules">Streaks of same value = bonus</div>
    </div>
  );
}
