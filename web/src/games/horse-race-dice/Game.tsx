import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HorseRaceDiceState, HorseRaceDiceAction, HorseRaceDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES, PAYOUTS } from "./state.js";
import "./Game.css";
export function HorseRaceDiceGame({ state, dispatch, onGameOver }: GameProps<HorseRaceDiceState, HorseRaceDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.dice && (
        <div className="dm-row">
          <div className="dm-die">{state.dice[0]}</div>
          <div className="dm-die">{state.dice[1]}</div>
        </div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          {CHOICES.map((c, i) => (
            <button data-testid="hint-target-horse-race-dice-predict" key={i} className={i % 2 === 0 ? "dm-btn" : "dm-btn alt"} onClick={() => dispatch({ type: "predict", choice: i } as HorseRaceDiceAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && state.resultIdx !== null && state.prediction !== null && (
        <>
          <div className="dm-result">{state.prediction === state.resultIdx ? "Correct! +" + PAYOUTS[state.resultIdx] : "Wrong — Result was " + CHOICES[state.resultIdx]}</div>
          <button data-testid="hint-target-horse-race-dice-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as HorseRaceDiceAction)}>Next</button>
        </>
      )}
    </div>
  );
}
