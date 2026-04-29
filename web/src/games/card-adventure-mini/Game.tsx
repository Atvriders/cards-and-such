import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardAdventureMiniState, CardAdventureMiniAction, CardAdventureMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CardAdventureMiniGame({ state, dispatch, onGameOver }: GameProps<CardAdventureMiniState, CardAdventureMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-cardadvemini-wrap"><div className="g-cardadvemini-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-cardadvemini-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-cardadvemini-wrap">
      <div className="g-cardadvemini-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-cardadvemini-score">{state.score} pts</div>
      <div className="g-cardadvemini-prompt">{r.question}</div>
      <div className="g-cardadvemini-grid">
        {r.choices.map((n, i) => {
          let c = "g-cardadvemini-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CardAdventureMiniAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-cardadvemini-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CardAdventureMiniAction)}>Submit</button>}
      {state.submitted && <button className="g-cardadvemini-btn next" onClick={() => dispatch({ type: "next" } as CardAdventureMiniAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
