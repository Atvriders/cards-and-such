import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBoxingKoState, DiceBoxingKoStateAction, DiceBoxingKoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceBoxingKoGame({ state, dispatch, onGameOver }: GameProps<DiceBoxingKoState, DiceBoxingKoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-boxing-ko-wrap"><div className="dice-boxing-ko-done"><h2>Done!</h2><div className="dice-boxing-ko-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-boxing-ko-wrap">
      <div className="dice-boxing-ko-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-boxing-ko-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-boxing-ko-row">{state.dice.map((d, i) => <div key={i} className="dice-boxing-ko-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-boxing-ko-btn" onClick={() => dispatch({ type:"roll" } as DiceBoxingKoStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-boxing-ko-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-boxing-ko-btn alt" onClick={() => dispatch({ type:"next" } as DiceBoxingKoStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
