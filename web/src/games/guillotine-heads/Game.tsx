import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GuillotineHeadsState, GuillotineHeadsAction, GuillotineHeadsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function GuillotineHeadsGame({ state, dispatch, onGameOver }: GameProps<GuillotineHeadsState, GuillotineHeadsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gguillo-wrap"><div className="gguillo-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gguillo-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gguillo-wrap">
      <div className="gguillo-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gguillo-score">{state.score} pts</div>
      <div className="gguillo-prompt">{r.question}</div>
      <div className="gguillo-grid">
        {r.choices.map((n, i) => {
          let cls = "gguillo-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-guillotine-heads-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as GuillotineHeadsAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gguillo-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as GuillotineHeadsAction)}>Submit</button>}
      {state.submitted && <button className="gguillo-btn next" onClick={() => dispatch({ type: "next" } as GuillotineHeadsAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
