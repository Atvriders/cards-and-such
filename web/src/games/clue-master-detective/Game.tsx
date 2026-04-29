import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClueMasterDetectiveState, ClueMasterDetectiveAction, ClueMasterDetectiveSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ClueMasterDetectiveGame({ state, dispatch, onGameOver }: GameProps<ClueMasterDetectiveState, ClueMasterDetectiveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="cluemasterdetective-wrap">
        <div className="cluemasterdetective-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="cluemasterdetective-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="cluemasterdetective-wrap">
      <div className="cluemasterdetective-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="cluemasterdetective-score">{state.score} pts</span>
      </div>
      <div className="cluemasterdetective-scenario">{p.scenario}</div>
      <ul className="cluemasterdetective-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="cluemasterdetective-options">
        {p.options.map((opt, i) => {
          let cls = "cluemasterdetective-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as ClueMasterDetectiveAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="cluemasterdetective-actions">
        {!state.resolved && (
          <button className="cluemasterdetective-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ClueMasterDetectiveAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="cluemasterdetective-btn next" onClick={() => dispatch({ type: "next" } as ClueMasterDetectiveAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
