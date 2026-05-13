import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SherlookDiffState, SherlookDiffAction, SherlookDiffSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SherlookDiffGame({ state, dispatch, onGameOver }: GameProps<SherlookDiffState, SherlookDiffSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="shrlokd-wrap"><div className="shrlokd-done bounce-in"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="shrlokd-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="shrlokd-wrap fade-in">
      <div className="shrlokd-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="shrlokd-score pulse">{state.score} pts</div>
      <div className="shrlokd-prompt">{r.question}</div>
      <div className="shrlokd-grid">
        {r.choices.map((n, i) => {
          let cls = "shrlokd-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-sherlook-diff-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SherlookDiffAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="shrlokd-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SherlookDiffAction)}>Submit</button>}
      {state.submitted && <button className="shrlokd-btn next" onClick={() => dispatch({ type: "next" } as SherlookDiffAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
