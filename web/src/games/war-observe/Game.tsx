import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WarObserveState, WarObserveAction, WarObserveSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function WarObserveGame({ state, dispatch, onGameOver }: GameProps<WarObserveState, WarObserveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="warobsv-wrap"><div className="warobsv-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="warobsv-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="warobsv-wrap">
      <div className="warobsv-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="warobsv-score">{state.score} pts</div>
      <div className="warobsv-prompt">{r.question}</div>
      <div className="warobsv-grid">
        {r.choices.map((n, i) => {
          let cls = "warobsv-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as WarObserveAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="warobsv-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as WarObserveAction)}>Submit</button>}
      {state.submitted && <button className="warobsv-btn next" onClick={() => dispatch({ type: "next" } as WarObserveAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
