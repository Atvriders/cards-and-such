import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStratArenaState, DiceStratArenaStateAction, DiceStratArenaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceStratArenaGame({ state, dispatch, onGameOver }: GameProps<DiceStratArenaState, DiceStratArenaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-strat-arena-wrap"><div className="dice-strat-arena-done"><h2>Done!</h2><div className="dice-strat-arena-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-strat-arena-wrap">
      <div className="dice-strat-arena-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-strat-arena-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-strat-arena-row">{state.dice.map((d, i) => <div key={i} className="dice-strat-arena-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-strat-arena-btn" onClick={() => dispatch({ type:"roll" } as DiceStratArenaStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-strat-arena-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-strat-arena-btn alt" onClick={() => dispatch({ type:"next" } as DiceStratArenaStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
