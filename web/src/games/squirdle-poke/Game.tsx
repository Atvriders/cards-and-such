import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SquirdlePokeState, SquirdlePokeAction, SquirdlePokeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SquirdlePokeGame({ state, dispatch, onGameOver }: GameProps<SquirdlePokeState, SquirdlePokeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gsquird-wrap"><div className="gsquird-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gsquird-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gsquird-wrap">
      <div className="gsquird-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gsquird-score">{state.score} pts</div>
      <div className="gsquird-prompt">{r.question}</div>
      <div className="gsquird-grid">
        {r.choices.map((n, i) => {
          let cls = "gsquird-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-squirdle-poke-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SquirdlePokeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gsquird-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SquirdlePokeAction)}>Submit</button>}
      {state.submitted && <button className="gsquird-btn next" onClick={() => dispatch({ type: "next" } as SquirdlePokeAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
