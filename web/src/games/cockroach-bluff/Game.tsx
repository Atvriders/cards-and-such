import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CockroachBluffState, CockroachBluffAction, CockroachBluffSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CockroachBluffGame({ state, dispatch, onGameOver }: GameProps<CockroachBluffState, CockroachBluffSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-cockbluf-wrap"><div className="g-cockbluf-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-cockbluf-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-cockbluf-wrap">
      <div className="g-cockbluf-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-cockbluf-score">{state.score} pts</div>
      <div className="g-cockbluf-prompt">{r.question}</div>
      <div className="g-cockbluf-grid">
        {r.choices.map((n, i) => {
          let c = "g-cockbluf-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CockroachBluffAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-cockbluf-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CockroachBluffAction)}>Submit</button>}
      {state.submitted && <button className="g-cockbluf-btn next" onClick={() => dispatch({ type: "next" } as CockroachBluffAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
