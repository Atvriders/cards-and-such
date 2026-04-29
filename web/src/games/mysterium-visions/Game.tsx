import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MysteriumVisionsState, MysteriumVisionsAction, MysteriumVisionsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MysteriumVisionsGame({ state, dispatch, onGameOver }: GameProps<MysteriumVisionsState, MysteriumVisionsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mysteriumvisions-wrap">
        <div className="mysteriumvisions-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="mysteriumvisions-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="mysteriumvisions-wrap">
      <div className="mysteriumvisions-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="mysteriumvisions-score">{state.score} pts</span>
      </div>
      <div className="mysteriumvisions-scenario">{p.scenario}</div>
      <ul className="mysteriumvisions-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="mysteriumvisions-options">
        {p.options.map((opt, i) => {
          let cls = "mysteriumvisions-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as MysteriumVisionsAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mysteriumvisions-actions">
        {!state.resolved && (
          <button className="mysteriumvisions-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MysteriumVisionsAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="mysteriumvisions-btn next" onClick={() => dispatch({ type: "next" } as MysteriumVisionsAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
