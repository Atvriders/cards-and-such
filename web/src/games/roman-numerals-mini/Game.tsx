import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RomanNumeralsMiniState, RomanNumeralsMiniAction, RomanNumeralsMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function RomanNumeralsMiniGame({ state, dispatch, onGameOver }: GameProps<RomanNumeralsMiniState, RomanNumeralsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="rn-wrap"><div className="rn-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {TOTAL_ROUNDS}</div><div className="rn-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="rn-wrap">
      <div className="rn-info">Round {state.currentIndex + 1} / {TOTAL_ROUNDS}</div>
      <div className="rn-score">{state.score} pts</div>
      <div className="rn-roman">{r.roman}</div>
      <div className="rn-grid">
        {r.choices.map((c, i) => {
          let cls = "rn-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as RomanNumeralsMiniAction)}>{c}</button>;
        })}
      </div>
      {!state.submitted && <button className="rn-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as RomanNumeralsMiniAction)}>Submit</button>}
      {state.submitted && <button className="rn-btn next" onClick={() => dispatch({ type: "next" } as RomanNumeralsMiniAction)}>{state.currentIndex + 1 >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>}
    </div>
  );
}
