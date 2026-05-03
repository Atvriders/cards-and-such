import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxMontyPythonState, FluxxMontyPythonAction, FluxxMontyPythonSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxMontyPythonGame({ state, dispatch, onGameOver }: GameProps<FluxxMontyPythonState, FluxxMontyPythonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxmontpyth-wrap"><div className="g-fluxmontpyth-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxmontpyth-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxmontpyth-wrap">
      <div className="g-fluxmontpyth-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxmontpyth-score">{state.score} pts</div>
      <div className="g-fluxmontpyth-prompt">{r.question}</div>
      <div className="g-fluxmontpyth-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxmontpyth-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-fluxx-monty-python-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxMontyPythonAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxmontpyth-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxMontyPythonAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxmontpyth-btn next" onClick={() => dispatch({ type: "next" } as FluxxMontyPythonAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
