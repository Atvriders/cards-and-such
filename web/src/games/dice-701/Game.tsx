import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice701State, Dice701Action, Dice701Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, START_SCORE } from "./state.js";
import "./Game.css";

export function Dice701Game({ state, dispatch, onGameOver }: GameProps<Dice701State, Dice701Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-701-wrap"><div className="ds-701-done"><h2>Done!</h2><div className="ds-701-final">{START_SCORE - state.remaining} pts (remaining: {state.remaining})</div></div></div>;
  }
  return (
    <div className="ds-701-wrap">
      <div className="ds-701-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-701-score">Remaining: {state.remaining}</div>
      {state.dice && (
        <div className="ds-701-row">{state.dice.map((d, i) => <div key={i} className="ds-701-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-701-btn" onClick={() => dispatch({ type:"roll" } as Dice701Action)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-701-result">-{state.lastPts}</div>
          <button className="ds-701-btn alt" onClick={() => dispatch({ type:"next" } as Dice701Action)}>Next</button>
        </>
      )}
    </div>
  );
}
