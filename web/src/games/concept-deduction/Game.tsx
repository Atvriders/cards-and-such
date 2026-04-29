import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConceptDeductionState, ConceptDeductionAction, ConceptDeductionSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ConceptDeductionGame({ state, dispatch, onGameOver }: GameProps<ConceptDeductionState, ConceptDeductionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="conceptdeduction-wrap">
        <div className="conceptdeduction-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="conceptdeduction-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="conceptdeduction-wrap">
      <div className="conceptdeduction-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="conceptdeduction-score">{state.score} pts</span>
      </div>
      <div className="conceptdeduction-scenario">{p.scenario}</div>
      <ul className="conceptdeduction-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="conceptdeduction-options">
        {p.options.map((opt, i) => {
          let cls = "conceptdeduction-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as ConceptDeductionAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="conceptdeduction-actions">
        {!state.resolved && (
          <button className="conceptdeduction-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ConceptDeductionAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="conceptdeduction-btn next" onClick={() => dispatch({ type: "next" } as ConceptDeductionAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
