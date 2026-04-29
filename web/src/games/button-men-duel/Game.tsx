import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ButtonMenDuelState, ButtonMenDuelAction, ButtonMenDuelSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES, PAYOUTS } from "./state.js";
import "./Game.css";
export function ButtonMenDuelGame({ state, dispatch, onGameOver }: GameProps<ButtonMenDuelState, ButtonMenDuelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">
          {state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}
        </div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          {CHOICES.map((c, i) => (
            <button key={i} className={i % 2 === 0 ? "dm-btn" : "dm-btn alt"} onClick={() => dispatch({ type: "predict", choice: i } as ButtonMenDuelAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && state.resultIdx !== null && state.prediction !== null && (
        <>
          <div className="dm-result">{state.prediction === state.resultIdx ? "Correct! +" + PAYOUTS[state.resultIdx] : "Wrong — Result was " + CHOICES[state.resultIdx]}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as ButtonMenDuelAction)}>Next</button>
        </>
      )}
    </div>
  );
}
