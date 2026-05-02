import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Countdown321State, Countdown321Action, Countdown321Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES, PAYOUTS } from "./state.js";
import "./Game.css";
export function Countdown321Game({ state, dispatch, onGameOver }: GameProps<Countdown321State, Countdown321Settings>): JSX.Element {
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
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
          <div className="dm-die">{state.dice[2]}</div>
        </div>
      )}
      {state.phase === "rolling" && (
        <button data-testid="hint-target-countdown-321-roll" className="dm-btn alt" onClick={() => dispatch({ type: "roll" } as Countdown321Action)}>Roll</button>
      )}
      {state.phase === "result" && state.lastIdx !== null && (
        <>
          <div className="dm-result">{CHOICES[state.lastIdx]} — +{PAYOUTS[state.lastIdx]}</div>
          <button data-testid="hint-target-countdown-321-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as Countdown321Action)}>Next</button>
        </>
      )}
    </div>
  );
}
