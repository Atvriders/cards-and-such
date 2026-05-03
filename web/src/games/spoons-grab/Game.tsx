import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpoonsGrabState, SpoonsGrabAction, SpoonsGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpoonsGrabGame({ state, dispatch, onGameOver }: GameProps<SpoonsGrabState, SpoonsGrabSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gspoons-wrap"><div className="gspoons-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gspoons-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gspoons-wrap">
      <div className="gspoons-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gspoons-score">{state.score} pts</div>
      <div className="gspoons-prompt">{r.question}</div>
      <div className="gspoons-grid">
        {r.choices.map((n, i) => {
          let cls = "gspoons-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-spoons-grab-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpoonsGrabAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gspoons-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpoonsGrabAction)}>Submit</button>}
      {state.submitted && <button className="gspoons-btn next" onClick={() => dispatch({ type: "next" } as SpoonsGrabAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
