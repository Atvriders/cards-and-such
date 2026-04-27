import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyTallState, DiceFrenzyTallAction, DiceFrenzyTallSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFrenzyTallGame({ state, dispatch, onGameOver }: GameProps<DiceFrenzyTallState, DiceFrenzyTallSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dft-wrap"><div className="dft-done"><h2>Done!</h2><div className="dft-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dft-wrap">
      <div className="dft-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dft-score">{state.score} pts</div>
      <div className="dft-info">Need: ascending stack (each die ≥ previous)</div>
      <div className="dft-row">
        {state.dice.map((v, i) => (
          <button
            key={i}
            className={`dft-die ${state.selected[i] ? "selected" : ""}`}
            disabled={state.phase !== "rolling"}
            onClick={() => dispatch({ type: "toggle", index: i } as DiceFrenzyTallAction)}
          >{v}</button>
        ))}
      </div>
      {state.phase === "rolling" && (
        <div className="dft-row">
          <button className="dft-btn alt" disabled={state.rerollUsed || state.selected.every(s => !s)} onClick={() => dispatch({ type: "reroll" } as DiceFrenzyTallAction)}>Reroll{state.rerollUsed ? " (used)" : ""}</button>
          <button className="dft-btn" onClick={() => dispatch({ type: "lock" } as DiceFrenzyTallAction)}>Lock</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className={`dft-feedback ${state.lastOk ? "ok" : "no"}`}>{state.lastOk ? "Ascending! +30" : "Not ascending."}</div>
          <button className="dft-btn alt" onClick={() => dispatch({ type: "next" } as DiceFrenzyTallAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
