import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SetShapesState, SetShapesAction, SetShapesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SetShapesGame({ state, dispatch, onGameOver }: GameProps<SetShapesState, SetShapesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="setshpz-wrap"><div className="setshpz-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="setshpz-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="setshpz-wrap">
      <div className="setshpz-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="setshpz-score">{state.score} pts</div>
      <div className="setshpz-prompt">{r.question}</div>
      <div className="setshpz-grid">
        {r.choices.map((n, i) => {
          let cls = "setshpz-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SetShapesAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="setshpz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SetShapesAction)}>Submit</button>}
      {state.submitted && <button className="setshpz-btn next" onClick={() => dispatch({ type: "next" } as SetShapesAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
