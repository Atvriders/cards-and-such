import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDeepSeaFishingState, DiceDeepSeaFishingAction, DiceDeepSeaFishingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceDeepSeaFishingGame({ state, dispatch, onGameOver }: GameProps<DiceDeepSeaFishingState, DiceDeepSeaFishingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-dicedeepseafish-wrap"><div className="g-dicedeepseafish-done"><h2>Match!</h2><div className="g-dicedeepseafish-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="g-dicedeepseafish-wrap">
      <div className="g-dicedeepseafish-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="g-dicedeepseafish-score">{state.score} pts</div>
      {state.dice && (
        <div className="g-dicedeepseafish-row">{state.dice.map((d, i) => <div key={i} className="g-dicedeepseafish-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="g-dicedeepseafish-btn" onClick={() => dispatch({ type:"roll" } as DiceDeepSeaFishingAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="g-dicedeepseafish-result">+{state.lastPts}</div>
          <button className="g-dicedeepseafish-btn alt" onClick={() => dispatch({ type:"next" } as DiceDeepSeaFishingAction)}>Next</button>
        </>
      )}
    </div>
  );
}
