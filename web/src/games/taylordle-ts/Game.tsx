import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TaylordleTsState, TaylordleTsAction, TaylordleTsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TaylordleTsGame({ state, dispatch, onGameOver }: GameProps<TaylordleTsState, TaylordleTsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gtaylor-wrap"><div className="gtaylor-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gtaylor-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gtaylor-wrap">
      <div className="gtaylor-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gtaylor-score">{state.score} pts</div>
      <div className="gtaylor-prompt">{r.question}</div>
      <div className="gtaylor-grid">
        {r.choices.map((n, i) => {
          let cls = "gtaylor-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as TaylordleTsAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gtaylor-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TaylordleTsAction)}>Submit</button>}
      {state.submitted && <button className="gtaylor-btn next" onClick={() => dispatch({ type: "next" } as TaylordleTsAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
