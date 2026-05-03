import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceToFaceState, FaceToFaceAction, FaceToFaceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FaceToFaceGame({ state, dispatch, onGameOver }: GameProps<FaceToFaceState, FaceToFaceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gfaceto-wrap"><div className="gfaceto-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gfaceto-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gfaceto-wrap">
      <div className="gfaceto-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gfaceto-score">{state.score} pts</div>
      <div className="gfaceto-prompt">{r.question}</div>
      <div className="gfaceto-grid">
        {r.choices.map((n, i) => {
          let cls = "gfaceto-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-face-to-face-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FaceToFaceAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gfaceto-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FaceToFaceAction)}>Submit</button>}
      {state.submitted && <button className="gfaceto-btn next" onClick={() => dispatch({ type: "next" } as FaceToFaceAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
