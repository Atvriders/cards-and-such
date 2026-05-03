import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxRulesState, FluxxRulesAction, FluxxRulesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxRulesGame({ state, dispatch, onGameOver }: GameProps<FluxxRulesState, FluxxRulesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gfluxxr-wrap"><div className="gfluxxr-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gfluxxr-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gfluxxr-wrap">
      <div className="gfluxxr-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gfluxxr-score">{state.score} pts</div>
      <div className="gfluxxr-prompt">{r.question}</div>
      <div className="gfluxxr-grid">
        {r.choices.map((n, i) => {
          let cls = "gfluxxr-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-fluxx-rules-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxRulesAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gfluxxr-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxRulesAction)}>Submit</button>}
      {state.submitted && <button className="gfluxxr-btn next" onClick={() => dispatch({ type: "next" } as FluxxRulesAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
