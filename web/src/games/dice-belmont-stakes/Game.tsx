import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBelmontStakesState, DiceBelmontStakesStateAction, DiceBelmontStakesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceBelmontStakesGame({ state, dispatch, onGameOver }: GameProps<DiceBelmontStakesState, DiceBelmontStakesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-belmont-stakes-wrap"><div className="dice-belmont-stakes-done"><h2>Done!</h2><div className="dice-belmont-stakes-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-belmont-stakes-wrap">
      <div className="dice-belmont-stakes-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-belmont-stakes-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-belmont-stakes-row">{state.dice.map((d, i) => <div key={i} className="dice-belmont-stakes-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-belmont-stakes-btn" onClick={() => dispatch({ type:"roll" } as DiceBelmontStakesStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-belmont-stakes-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-belmont-stakes-btn alt" onClick={() => dispatch({ type:"next" } as DiceBelmontStakesStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
