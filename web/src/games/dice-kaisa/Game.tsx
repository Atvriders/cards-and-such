import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKaisaState, DiceKaisaStateAction, DiceKaisaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceKaisaGame({ state, dispatch, onGameOver }: GameProps<DiceKaisaState, DiceKaisaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-kaisa-wrap"><div className="dice-kaisa-done"><h2>Done!</h2><div className="dice-kaisa-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-kaisa-wrap">
      <div className="dice-kaisa-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-kaisa-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-kaisa-row">{state.dice.map((d, i) => <div key={i} className="dice-kaisa-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-kaisa-btn" onClick={() => dispatch({ type:"roll" } as DiceKaisaStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-kaisa-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-kaisa-btn alt" onClick={() => dispatch({ type:"next" } as DiceKaisaStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
