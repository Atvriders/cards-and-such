import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRussianPyramidState, DiceRussianPyramidStateAction, DiceRussianPyramidSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceRussianPyramidGame({ state, dispatch, onGameOver }: GameProps<DiceRussianPyramidState, DiceRussianPyramidSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-russian-pyramid-wrap"><div className="dice-russian-pyramid-done"><h2>Done!</h2><div className="dice-russian-pyramid-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-russian-pyramid-wrap">
      <div className="dice-russian-pyramid-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-russian-pyramid-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-russian-pyramid-row">{state.dice.map((d, i) => <div key={i} className="dice-russian-pyramid-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-russian-pyramid-btn" onClick={() => dispatch({ type:"roll" } as DiceRussianPyramidStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-russian-pyramid-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-russian-pyramid-btn alt" onClick={() => dispatch({ type:"next" } as DiceRussianPyramidStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
