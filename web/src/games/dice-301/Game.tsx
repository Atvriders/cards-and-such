import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice301State, Dice301Action, Dice301Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, START_SCORE } from "./state.js";
import "./Game.css";

export function Dice301Game({ state, dispatch, onGameOver }: GameProps<Dice301State, Dice301Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-301-wrap"><div className="ds-301-done"><h2>Done!</h2><div className="ds-301-final">{START_SCORE - state.remaining} pts (remaining: {state.remaining})</div></div></div>;
  }
  return (
    <div className="ds-301-wrap">
      <div className="ds-301-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-301-score">Remaining: {state.remaining}</div>
      {state.dice && (
        <div className="ds-301-row">{state.dice.map((d, i) => <div key={i} className="ds-301-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-301-btn" onClick={() => dispatch({ type:"roll" } as Dice301Action)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-301-result">-{state.lastPts}</div>
          <button className="ds-301-btn alt" onClick={() => dispatch({ type:"next" } as Dice301Action)}>Next</button>
        </>
      )}
    </div>
  );
}
