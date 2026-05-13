import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DilemmaDeckState, DilemmaDeckAction, DilemmaDeckSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DilemmaDeckGame({ state, dispatch, onGameOver }: GameProps<DilemmaDeckState, DilemmaDeckSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-diledeck-wrap"><div className="g-diledeck-done bounce-in"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-diledeck-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-diledeck-wrap fade-in">
      <div className="g-diledeck-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-diledeck-score pulse">{state.score} pts</div>
      <div className="g-diledeck-prompt">{r.question}</div>
      <div className="g-diledeck-grid">
        {r.choices.map((n, i) => {
          let c = "g-diledeck-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-dilemma-deck-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as DilemmaDeckAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-diledeck-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DilemmaDeckAction)}>Submit</button>}
      {state.submitted && <button className="g-diledeck-btn next" onClick={() => dispatch({ type: "next" } as DilemmaDeckAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
