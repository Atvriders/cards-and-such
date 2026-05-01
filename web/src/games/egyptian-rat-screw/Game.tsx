import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EgyptianRatScrewState, EgyptianRatScrewAction, EgyptianRatScrewSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function EgyptianRatScrewGame({ state, dispatch, onGameOver }: GameProps<EgyptianRatScrewState, EgyptianRatScrewSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="egyrat-wrap"><div className="egyrat-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="egyrat-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="egyrat-wrap">
      <div className="egyrat-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="egyrat-score">{state.score} pts</div>
      <div className="egyrat-prompt">{r.question}</div>
      <div className="egyrat-grid">
        {r.choices.map((n, i) => {
          let cls = "egyrat-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as EgyptianRatScrewAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="egyrat-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as EgyptianRatScrewAction)}>Submit</button>}
      {state.submitted && <button className="egyrat-btn next" onClick={() => dispatch({ type: "next" } as EgyptianRatScrewAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
