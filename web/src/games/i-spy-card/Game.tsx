import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ISpyCardState, ISpyCardAction, ISpyCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ISpyCardGame({ state, dispatch, onGameOver }: GameProps<ISpyCardState, ISpyCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gispyca-wrap"><div className="gispyca-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gispyca-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gispyca-wrap">
      <div className="gispyca-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gispyca-score">{state.score} pts</div>
      <div className="gispyca-prompt">{r.question}</div>
      <div className="gispyca-grid">
        {r.choices.map((n, i) => {
          let cls = "gispyca-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ISpyCardAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gispyca-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ISpyCardAction)}>Submit</button>}
      {state.submitted && <button className="gispyca-btn next" onClick={() => dispatch({ type: "next" } as ISpyCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
