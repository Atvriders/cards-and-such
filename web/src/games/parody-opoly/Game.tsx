import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParodyOpolyState, ParodyOpolyAction, ParodyOpolySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ParodyOpolyGame({ state, dispatch, onGameOver }: GameProps<ParodyOpolyState, ParodyOpolySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-paroopol-wrap"><div className="g-paroopol-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-paroopol-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-paroopol-wrap">
      <div className="g-paroopol-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-paroopol-score">{state.score} pts</div>
      <div className="g-paroopol-prompt">{r.question}</div>
      <div className="g-paroopol-grid">
        {r.choices.map((n, i) => {
          let c = "g-paroopol-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-parody-opoly-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ParodyOpolyAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-paroopol-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ParodyOpolyAction)}>Submit</button>}
      {state.submitted && <button className="g-paroopol-btn next" onClick={() => dispatch({ type: "next" } as ParodyOpolyAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
