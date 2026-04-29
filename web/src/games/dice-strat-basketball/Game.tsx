import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratBasketballState, DiceStratBasketballStateAction, DiceStratBasketballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceStratBasketballGame({ state, dispatch, onGameOver }: GameProps<DiceStratBasketballState, DiceStratBasketballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-strat-basketball-wrap"><div className="dice-strat-basketball-done"><h2>Done!</h2><div className="dice-strat-basketball-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-strat-basketball-wrap">
      <div className="dice-strat-basketball-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-strat-basketball-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-strat-basketball-row">{state.dice.map((d, i) => <div key={i} className="dice-strat-basketball-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-strat-basketball-btn" onClick={() => dispatch({ type:"roll" } as DiceStratBasketballStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-strat-basketball-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-strat-basketball-btn alt" onClick={() => dispatch({ type:"next" } as DiceStratBasketballStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
