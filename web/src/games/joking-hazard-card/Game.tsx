import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JokingHazardCardState, JokingHazardCardAction, JokingHazardCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function JokingHazardCardGame({ state, dispatch, onGameOver }: GameProps<JokingHazardCardState, JokingHazardCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-jokihazacard-wrap"><div className="g-jokihazacard-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-jokihazacard-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-jokihazacard-wrap">
      <div className="g-jokihazacard-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-jokihazacard-score">{state.score} pts</div>
      <div className="g-jokihazacard-prompt">{r.question}</div>
      <div className="g-jokihazacard-grid">
        {r.choices.map((n, i) => {
          let c = "g-jokihazacard-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-joking-hazard-card-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as JokingHazardCardAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-jokihazacard-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as JokingHazardCardAction)}>Submit</button>}
      {state.submitted && <button className="g-jokihazacard-btn next" onClick={() => dispatch({ type: "next" } as JokingHazardCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
