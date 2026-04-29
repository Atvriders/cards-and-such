import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCurlingStonesState, DiceCurlingStonesStateAction, DiceCurlingStonesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_POINTS } from "./state.js";
import "./Game.css";

export function DiceCurlingStonesGame({ state, dispatch, onGameOver }: GameProps<DiceCurlingStonesState, DiceCurlingStonesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dice-curling-stones-wrap"><div className="dice-curling-stones-done"><h2>Done!</h2><div className="dice-curling-stones-final">You {state.myPoints} - Opp {state.oppPoints}</div></div></div>;
  }
  return (
    <div className="dice-curling-stones-wrap">
      <div className="dice-curling-stones-info">Round {state.round} / {TOTAL_ROUNDS} - First to {TARGET_POINTS}</div>
      <div className="dice-curling-stones-score">You {state.myPoints} - Opp {state.oppPoints}</div>
      {state.dice && (
        <div className="dice-curling-stones-row">{state.dice.map((d, i) => <div key={i} className="dice-curling-stones-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="dice-curling-stones-btn" onClick={() => dispatch({ type:"roll" } as DiceCurlingStonesStateAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="dice-curling-stones-result">{state.lastDelta > 0 ? "+" + state.lastDelta + " You" : state.lastDelta < 0 ? (-state.lastDelta) + " Opp" : "Rally"}</div>
          <button className="dice-curling-stones-btn alt" onClick={() => dispatch({ type:"next" } as DiceCurlingStonesStateAction)}>Next</button>
        </>
      )}
    </div>
  );
}
