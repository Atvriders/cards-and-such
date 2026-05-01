import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimonSwipeState, SimonSwipeAction, SimonSwipeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SimonSwipeGame({ state, dispatch, onGameOver }: GameProps<SimonSwipeState, SimonSwipeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="smnswp-wrap"><div className="smnswp-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="smnswp-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="smnswp-wrap">
      <div className="smnswp-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="smnswp-score">{state.score} pts</div>
      <div className="smnswp-prompt">{r.question}</div>
      <div className="smnswp-grid">
        {r.choices.map((n, i) => {
          let cls = "smnswp-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SimonSwipeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="smnswp-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SimonSwipeAction)}>Submit</button>}
      {state.submitted && <button className="smnswp-btn next" onClick={() => dispatch({ type: "next" } as SimonSwipeAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
