import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PokerDiceFiveState, PokerDiceFiveAction, PokerDiceFiveSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES, PAYOUTS } from "./state.js";
import "./Game.css";
export function PokerDiceFiveGame({ state, dispatch, onGameOver }: GameProps<PokerDiceFiveState, PokerDiceFiveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-poker-dice-five-roll" className="dm-btn alt" onClick={() => dispatch({ type: "roll" } as PokerDiceFiveAction)}>Roll</button>
      )}
      {state.phase === "result" && state.lastIdx !== null && (
        <>
          <div className="dm-result">{CHOICES[state.lastIdx]} — +{PAYOUTS[state.lastIdx]}</div>
          <button data-testid="hint-target-poker-dice-five-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as PokerDiceFiveAction)}>Next</button>
        </>
      )}
    </div>
  );
}
