import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFatBoyDartsState, DiceFatBoyDartsAction, DiceFatBoyDartsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFatBoyDartsGame({ state, dispatch, onGameOver }: GameProps<DiceFatBoyDartsState, DiceFatBoyDartsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicefatboydart-wrap"><div className="g-dicefatboydart-done"><h2>Match!</h2><div className="g-dicefatboydart-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicefatboydart-wrap">
      <div className="g-dicefatboydart-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicefatboydart-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicefatboydart-row">{state.dice.map((d, i) => <div key={i} className="g-dicefatboydart-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicefatboydart-btn" onClick={() => dispatch({ type:"roll" } as DiceFatBoyDartsAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicefatboydart-result">+{state.lastPts}</div>
          <button className="g-dicefatboydart-btn alt" onClick={() => dispatch({ type:"next" } as DiceFatBoyDartsAction)}>Next</button>
        </>
      )}
    </div>
  );
}
