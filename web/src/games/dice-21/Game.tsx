import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice21State, Dice21Action, Dice21Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice21Game({ state, dispatch, onGameOver }: GameProps<Dice21State, Dice21Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.totalScore} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">Total: {state.totalScore} | Sum: {state.sum}</div>
      {state.rolls.length > 0 && (
        <div className="dm-row">
          {state.rolls.map((r, i) => <div key={i} className={`dm-die ${state.busted && i === state.rolls.length - 1 ? "danger" : ""}`}>{r}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as Dice21Action)}>Hit</button>
          <button className="dm-btn alt" disabled={state.sum === 0} onClick={() => dispatch({ type:"stand" } as Dice21Action)}>Stand ({state.sum})</button>
        </div>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.busted ? `BUSTED at ${state.sum}!` : `Scored: +${state.lastPts}`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as Dice21Action)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
