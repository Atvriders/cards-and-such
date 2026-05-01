import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PresidentsMemoryState, PresidentsMemoryAction, PresidentsMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PresidentsMemoryGame({ state, dispatch, onGameOver }: GameProps<PresidentsMemoryState, PresidentsMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="presmemo-wrap"><div className="presmemo-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="presmemo-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="presmemo-wrap">
      <div className="presmemo-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="presmemo-score">{state.score} pts</div>
      <div className="presmemo-prompt">{r.question}</div>
      <div className="presmemo-grid">
        {r.choices.map((n, i) => {
          let cls = "presmemo-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as PresidentsMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="presmemo-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as PresidentsMemoryAction)}>Submit</button>}
      {state.submitted && <button className="presmemo-btn next" onClick={() => dispatch({ type: "next" } as PresidentsMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
