import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AnimalsMemoryState, AnimalsMemoryAction, AnimalsMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AnimalsMemoryGame({ state, dispatch, onGameOver }: GameProps<AnimalsMemoryState, AnimalsMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="anmlmem-wrap"><div className="anmlmem-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="anmlmem-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="anmlmem-wrap">
      <div className="anmlmem-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="anmlmem-score">{state.score} pts</div>
      <div className="anmlmem-prompt">{r.question}</div>
      <div className="anmlmem-grid">
        {r.choices.map((n, i) => {
          let cls = "anmlmem-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as AnimalsMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="anmlmem-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as AnimalsMemoryAction)}>Submit</button>}
      {state.submitted && <button className="anmlmem-btn next" onClick={() => dispatch({ type: "next" } as AnimalsMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
