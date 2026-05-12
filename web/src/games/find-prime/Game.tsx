import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FindPrimeState, FindPrimeAction, FindPrimeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function FindPrimeGame({ state, dispatch, onGameOver }: GameProps<FindPrimeState, FindPrimeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="fp-wrap"><div className="fp-done bounce-in"><h2>Done!</h2><div>Correct: {state.correctCount} / {TOTAL_ROUNDS}</div><div className="fp-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="fp-wrap fade-in">
      <div className="fp-info">Round {state.currentIndex + 1} / {TOTAL_ROUNDS}</div>
      <div className="fp-score pulse">{state.score} pts</div>
      <div className="fp-prompt">Find the prime number</div>
      <div className="fp-grid">
        {r.numbers.map((n, i) => {
          let cls = "fp-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-find-prime-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FindPrimeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="fp-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FindPrimeAction)}>Submit</button>}
      {state.submitted && <button className="fp-btn next" onClick={() => dispatch({ type: "next" } as FindPrimeAction)}>{state.currentIndex + 1 >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>}
    </div>
  );
}
