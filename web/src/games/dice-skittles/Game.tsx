import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSkittlesState, DiceSkittlesAction, DiceSkittlesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSkittlesGame({ state, dispatch, onGameOver }: GameProps<DiceSkittlesState, DiceSkittlesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-skittles-wrap"><div className="ds-skittles-done"><h2>Done!</h2><div className="ds-skittles-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-skittles-wrap">
      <div className="ds-skittles-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-skittles-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-skittles-row">{state.dice.map((d, i) => <div key={i} className="ds-skittles-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-skittles-btn" onClick={() => dispatch({ type:"roll" } as DiceSkittlesAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-skittles-result">+{state.lastPts}</div>
          <button className="ds-skittles-btn alt" onClick={() => dispatch({ type:"next" } as DiceSkittlesAction)}>Next</button>
        </>
      )}
    </div>
  );
}
