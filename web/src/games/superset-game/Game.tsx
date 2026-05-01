import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SupersetGameState, SupersetGameAction, SupersetGameSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SupersetGameGame({ state, dispatch, onGameOver }: GameProps<SupersetGameState, SupersetGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="supsetg-wrap"><div className="supsetg-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="supsetg-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="supsetg-wrap">
      <div className="supsetg-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="supsetg-score">{state.score} pts</div>
      <div className="supsetg-prompt">{r.question}</div>
      <div className="supsetg-grid">
        {r.choices.map((n, i) => {
          let cls = "supsetg-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SupersetGameAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="supsetg-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SupersetGameAction)}>Submit</button>}
      {state.submitted && <button className="supsetg-btn next" onClick={() => dispatch({ type: "next" } as SupersetGameAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
