import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WeeklyChess960State, WeeklyChess960Action, WeeklyChess960Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function WeeklyChess960Game({ state, dispatch, onGameOver }: GameProps<WeeklyChess960State, WeeklyChess960Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-weekches-wrap"><div className="g-weekches-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-weekches-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-weekches-wrap">
      <div className="g-weekches-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-weekches-score">{state.score} pts</div>
      <div className="g-weekches-prompt">{r.question}</div>
      <div className="g-weekches-grid">
        {r.choices.map((n, i) => {
          let c = "g-weekches-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-weekly-chess960-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as WeeklyChess960Action)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-weekches-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as WeeklyChess960Action)}>Submit</button>}
      {state.submitted && <button className="g-weekches-btn next" onClick={() => dispatch({ type: "next" } as WeeklyChess960Action)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
