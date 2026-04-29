import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceIceFishingState, DiceIceFishingAction, DiceIceFishingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceIceFishingGame({ state, dispatch, onGameOver }: GameProps<DiceIceFishingState, DiceIceFishingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-diceicefish-wrap"><div className="g-diceicefish-done"><h2>Match!</h2><div className="g-diceicefish-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-diceicefish-wrap">
      <div className="g-diceicefish-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-diceicefish-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-diceicefish-row">{state.dice.map((d, i) => <div key={i} className="g-diceicefish-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-diceicefish-btn" onClick={() => dispatch({ type:"roll" } as DiceIceFishingAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-diceicefish-result">+{state.lastPts}</div>
          <button className="g-diceicefish-btn alt" onClick={() => dispatch({ type:"next" } as DiceIceFishingAction)}>Next</button>
        </>
      )}
    </div>
  );
}
