import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SetJuniorState, SetJuniorAction, SetJuniorSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SetJuniorGame({ state, dispatch, onGameOver }: GameProps<SetJuniorState, SetJuniorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="setjnr-wrap"><div className="setjnr-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="setjnr-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="setjnr-wrap">
      <div className="setjnr-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="setjnr-score">{state.score} pts</div>
      <div className="setjnr-prompt">{r.question}</div>
      <div className="setjnr-grid">
        {r.choices.map((n, i) => {
          let cls = "setjnr-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SetJuniorAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="setjnr-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SetJuniorAction)}>Submit</button>}
      {state.submitted && <button className="setjnr-btn next" onClick={() => dispatch({ type: "next" } as SetJuniorAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
