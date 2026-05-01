import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DisneyMemoryState, DisneyMemoryAction, DisneyMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DisneyMemoryGame({ state, dispatch, onGameOver }: GameProps<DisneyMemoryState, DisneyMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dsnymem-wrap"><div className="dsnymem-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="dsnymem-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="dsnymem-wrap">
      <div className="dsnymem-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="dsnymem-score">{state.score} pts</div>
      <div className="dsnymem-prompt">{r.question}</div>
      <div className="dsnymem-grid">
        {r.choices.map((n, i) => {
          let cls = "dsnymem-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as DisneyMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="dsnymem-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DisneyMemoryAction)}>Submit</button>}
      {state.submitted && <button className="dsnymem-btn next" onClick={() => dispatch({ type: "next" } as DisneyMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
