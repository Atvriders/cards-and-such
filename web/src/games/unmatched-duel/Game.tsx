import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { unmatchedDuelState, unmatchedDuelAction, unmatchedDuelSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function unmatchedDuelGame({ state, dispatch, onGameOver }: GameProps<unmatchedDuelState, unmatchedDuelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gmem-wrap"><div className="gmem-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gmem-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gmem-wrap">
      <div className="gmem-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gmem-score">{state.score} pts</div>
      <div className="gmem-prompt">{r.question}</div>
      <div className="gmem-grid">
        {r.choices.map((n, i) => {
          let cls = "gmem-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as unmatchedDuelAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gmem-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as unmatchedDuelAction)}>Submit</button>}
      {state.submitted && <button className="gmem-btn next" onClick={() => dispatch({ type: "next" } as unmatchedDuelAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
