import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnstableUnicornsMiniState, UnstableUnicornsMiniAction, UnstableUnicornsMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function UnstableUnicornsMiniGame({ state, dispatch, onGameOver }: GameProps<UnstableUnicornsMiniState, UnstableUnicornsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-unstunicmini-wrap"><div className="g-unstunicmini-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-unstunicmini-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-unstunicmini-wrap">
      <div className="g-unstunicmini-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-unstunicmini-score">{state.score} pts</div>
      <div className="g-unstunicmini-prompt">{r.question}</div>
      <div className="g-unstunicmini-grid">
        {r.choices.map((n, i) => {
          let c = "g-unstunicmini-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-unstable-unicorns-mini-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as UnstableUnicornsMiniAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-unstunicmini-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as UnstableUnicornsMiniAction)}>Submit</button>}
      {state.submitted && <button className="g-unstunicmini-btn next" onClick={() => dispatch({ type: "next" } as UnstableUnicornsMiniAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
