import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFormulaDeState, DiceFormulaDeAction, DiceFormulaDeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceFormulaDeGame({ state, dispatch, onGameOver }: GameProps<DiceFormulaDeState, DiceFormulaDeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-diceformde-wrap"><div className="g-diceformde-done"><h2>Match!</h2><div className="g-diceformde-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-diceformde-wrap">
      <div className="g-diceformde-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-diceformde-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-diceformde-row">{state.dice.map((d, i) => <div key={i} className="g-diceformde-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-diceformde-btn" onClick={() => dispatch({ type:"roll" } as DiceFormulaDeAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-diceformde-result">+{state.lastPts}</div>
          <button className="g-diceformde-btn alt" onClick={() => dispatch({ type:"next" } as DiceFormulaDeAction)}>Next</button>
        </>
      )}
    </div>
  );
}
