import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodenamesPicturesState, CodenamesPicturesAction, CodenamesPicturesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CodenamesPicturesGame({ state, dispatch, onGameOver }: GameProps<CodenamesPicturesState, CodenamesPicturesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="codenamespictures-wrap">
        <div className="codenamespictures-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="codenamespictures-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="codenamespictures-wrap">
      <div className="codenamespictures-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="codenamespictures-score">{state.score} pts</span>
      </div>
      <div className="codenamespictures-scenario">{p.scenario}</div>
      <ul className="codenamespictures-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="codenamespictures-options">
        {p.options.map((opt, i) => {
          let cls = "codenamespictures-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as CodenamesPicturesAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="codenamespictures-actions">
        {!state.resolved && (
          <button className="codenamespictures-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CodenamesPicturesAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="codenamespictures-btn next" onClick={() => dispatch({ type: "next" } as CodenamesPicturesAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
