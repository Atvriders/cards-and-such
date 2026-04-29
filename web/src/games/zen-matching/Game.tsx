import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZenMatchingState, ZenMatchingAction, ZenMatchingSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ZenMatchingGame({ state, dispatch, onGameOver }: GameProps<ZenMatchingState, ZenMatchingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gzenmat-wrap"><div className="gzenmat-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gzenmat-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gzenmat-wrap">
      <div className="gzenmat-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gzenmat-score">{state.score} pts</div>
      <div className="gzenmat-prompt">{r.question}</div>
      <div className="gzenmat-grid">
        {r.choices.map((n, i) => {
          let cls = "gzenmat-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ZenMatchingAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gzenmat-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ZenMatchingAction)}>Submit</button>}
      {state.submitted && <button className="gzenmat-btn next" onClick={() => dispatch({ type: "next" } as ZenMatchingAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
