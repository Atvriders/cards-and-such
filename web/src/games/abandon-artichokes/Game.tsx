import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AbandonArtichokesState, AbandonArtichokesAction, AbandonArtichokesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AbandonArtichokesGame({ state, dispatch, onGameOver }: GameProps<AbandonArtichokesState, AbandonArtichokesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gabando-wrap"><div className="gabando-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gabando-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gabando-wrap">
      <div className="gabando-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gabando-score">{state.score} pts</div>
      <div className="gabando-prompt">{r.question}</div>
      <div className="gabando-grid">
        {r.choices.map((n, i) => {
          let cls = "gabando-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as AbandonArtichokesAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gabando-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as AbandonArtichokesAction)}>Submit</button>}
      {state.submitted && <button className="gabando-btn next" onClick={() => dispatch({ type: "next" } as AbandonArtichokesAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
