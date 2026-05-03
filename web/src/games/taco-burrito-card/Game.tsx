import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TacoBurritoCardState, TacoBurritoCardAction, TacoBurritoCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TacoBurritoCardGame({ state, dispatch, onGameOver }: GameProps<TacoBurritoCardState, TacoBurritoCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-tacoburrcard-wrap"><div className="g-tacoburrcard-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-tacoburrcard-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-tacoburrcard-wrap">
      <div className="g-tacoburrcard-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-tacoburrcard-score">{state.score} pts</div>
      <div className="g-tacoburrcard-prompt">{r.question}</div>
      <div className="g-tacoburrcard-grid">
        {r.choices.map((n, i) => {
          let c = "g-tacoburrcard-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-taco-burrito-card-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as TacoBurritoCardAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-tacoburrcard-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TacoBurritoCardAction)}>Submit</button>}
      {state.submitted && <button className="g-tacoburrcard-btn next" onClick={() => dispatch({ type: "next" } as TacoBurritoCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
