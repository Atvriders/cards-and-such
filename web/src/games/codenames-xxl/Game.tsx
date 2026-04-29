import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodenamesXxlState, CodenamesXxlAction, CodenamesXxlSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CodenamesXxlGame({ state, dispatch, onGameOver }: GameProps<CodenamesXxlState, CodenamesXxlSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="codenamesxxl-wrap">
        <div className="codenamesxxl-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="codenamesxxl-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="codenamesxxl-wrap">
      <div className="codenamesxxl-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="codenamesxxl-score">{state.score} pts</span>
      </div>
      <div className="codenamesxxl-scenario">{p.scenario}</div>
      <ul className="codenamesxxl-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="codenamesxxl-options">
        {p.options.map((opt, i) => {
          let cls = "codenamesxxl-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as CodenamesXxlAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="codenamesxxl-actions">
        {!state.resolved && (
          <button className="codenamesxxl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CodenamesXxlAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="codenamesxxl-btn next" onClick={() => dispatch({ type: "next" } as CodenamesXxlAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
