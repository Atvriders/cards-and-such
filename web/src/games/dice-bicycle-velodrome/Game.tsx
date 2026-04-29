import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBicycleVelodromeState, DiceBicycleVelodromeStateAction, DiceBicycleVelodromeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceBicycleVelodromeGame({ state, dispatch, onGameOver }: GameProps<DiceBicycleVelodromeState, DiceBicycleVelodromeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-bicycle-velodrome-wrap"><div className="dice-bicycle-velodrome-done"><h2>Done!</h2><div className="dice-bicycle-velodrome-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-bicycle-velodrome-wrap">
      <div className="dice-bicycle-velodrome-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-bicycle-velodrome-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-bicycle-velodrome-row">{state.dice.map((d, i) => <div key={i} className="dice-bicycle-velodrome-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-bicycle-velodrome-btn" onClick={() => dispatch({ type:"roll" } as DiceBicycleVelodromeStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-bicycle-velodrome-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-bicycle-velodrome-btn alt" onClick={() => dispatch({ type:"next" } as DiceBicycleVelodromeStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
