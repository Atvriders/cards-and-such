import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DobbleEuropeanState, DobbleEuropeanAction, DobbleEuropeanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DobbleEuropeanGame({ state, dispatch, onGameOver }: GameProps<DobbleEuropeanState, DobbleEuropeanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dobbleeuropean-wrap"><div className="dobbleeuropean-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="dobbleeuropean-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="dobbleeuropean-wrap">
      <div className="dobbleeuropean-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="dobbleeuropean-score">{state.score} pts</div>
      <div className="dobbleeuropean-prompt">{r.question}</div>
      <div className="dobbleeuropean-grid">
        {r.choices.map((n, i) => {
          let cls = "dobbleeuropean-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as DobbleEuropeanAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="dobbleeuropean-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DobbleEuropeanAction)}>Submit</button>}
      {state.submitted && <button className="dobbleeuropean-btn next" onClick={() => dispatch({ type: "next" } as DobbleEuropeanAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
