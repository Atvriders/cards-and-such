import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePursuePennantState, DicePursuePennantStateAction, DicePursuePennantSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DicePursuePennantGame({ state, dispatch, onGameOver }: GameProps<DicePursuePennantState, DicePursuePennantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-pursue-pennant-wrap"><div className="dice-pursue-pennant-done"><h2>Done!</h2><div className="dice-pursue-pennant-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-pursue-pennant-wrap">
      <div className="dice-pursue-pennant-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-pursue-pennant-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-pursue-pennant-row">{state.dice.map((d, i) => <div key={i} className="dice-pursue-pennant-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-pursue-pennant-btn" onClick={() => dispatch({ type:"roll" } as DicePursuePennantStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-pursue-pennant-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-pursue-pennant-btn alt" onClick={() => dispatch({ type:"next" } as DicePursuePennantStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
