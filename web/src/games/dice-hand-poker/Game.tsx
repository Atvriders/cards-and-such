import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHandPokerState, DiceHandPokerAction, DiceHandPokerSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, MAX_ROLLS } from "./state.js";
import "./Game.css";

export function DiceHandPokerGame({ state, dispatch, onGameOver }: GameProps<DiceHandPokerState, DiceHandPokerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  const canHold = state.rollsLeft > 0 && state.rollsLeft < MAX_ROLLS;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Rolls left: {state.rollsLeft}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">
        {state.dice.map((d, i) => (
          <button key={i}
            className={`dm-die ${state.held[i] ? "held" : ""}`}
            disabled={!canHold}
            onClick={() => dispatch({ type:"toggle", idx:i } as DiceHandPokerAction)}
          >{d || "?"}</button>
        ))}
      </div>
      {state.phase === "rolling" && state.rollsLeft > 0 && (
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceHandPokerAction)}>{state.rollsLeft === MAX_ROLLS ? "Roll" : "Re-roll un-held"}</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastHand}: +{state.lastPts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceHandPokerAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
