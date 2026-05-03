import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FramedFilmState, FramedFilmAction, FramedFilmSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FramedFilmGame({ state, dispatch, onGameOver }: GameProps<FramedFilmState, FramedFilmSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gframed-wrap"><div className="gframed-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gframed-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gframed-wrap">
      <div className="gframed-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gframed-score">{state.score} pts</div>
      <div className="gframed-prompt">{r.question}</div>
      <div className="gframed-grid">
        {r.choices.map((n, i) => {
          let cls = "gframed-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-framed-film-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FramedFilmAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gframed-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FramedFilmAction)}>Submit</button>}
      {state.submitted && <button className="gframed-btn next" onClick={() => dispatch({ type: "next" } as FramedFilmAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
