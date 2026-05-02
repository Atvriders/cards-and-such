import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicelandRouletteState, DicelandRouletteAction, DicelandRouletteSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CHOICES, PAYOUTS } from "./state.js";
import "./Game.css";
export function DicelandRouletteGame({ state, dispatch, onGameOver }: GameProps<DicelandRouletteState, DicelandRouletteSettings>): JSX.Element {
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
        </div>
      )}
      {state.phase === "predict" && (
        <div className="dm-row">
          {CHOICES.map((c, i) => (
            <button data-testid="hint-target-diceland-roulette-predict" key={i} className={i % 2 === 0 ? "dm-btn" : "dm-btn alt"} onClick={() => dispatch({ type: "predict", choice: i } as DicelandRouletteAction)}>{c}</button>
          ))}
        </div>
      )}
      {state.phase === "result" && state.resultIdx !== null && state.prediction !== null && (
        <>
          <div className="dm-result">{state.prediction === state.resultIdx ? "Correct! +" + PAYOUTS[state.resultIdx] : "Wrong — Result was " + CHOICES[state.resultIdx]}</div>
          <button data-testid="hint-target-diceland-roulette-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DicelandRouletteAction)}>Next</button>
        </>
      )}
    </div>
  );
}
