import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKingState, DiceKingAction, DiceKingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceKingGame({ state, dispatch, onGameOver }: GameProps<DiceKingState, DiceKingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Highest sum: {state.highestSum}</div><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts (best: {state.highestSum})</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-dice-king-roll" className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceKingAction)}>Roll 3</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">+{state.lastPts}</div>
          <button data-testid="hint-target-dice-king-next" className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceKingAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
