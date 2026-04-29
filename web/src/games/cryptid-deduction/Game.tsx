import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CryptidDeductionState, CryptidDeductionAction, CryptidDeductionSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CryptidDeductionGame({ state, dispatch, onGameOver }: GameProps<CryptidDeductionState, CryptidDeductionSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="cryptiddeduction-wrap">
        <div className="cryptiddeduction-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="cryptiddeduction-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="cryptiddeduction-wrap">
      <div className="cryptiddeduction-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="cryptiddeduction-score">{state.score} pts</span>
      </div>
      <div className="cryptiddeduction-scenario">{p.scenario}</div>
      <ul className="cryptiddeduction-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="cryptiddeduction-options">
        {p.options.map((opt, i) => {
          let cls = "cryptiddeduction-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as CryptidDeductionAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="cryptiddeduction-actions">
        {!state.resolved && (
          <button className="cryptiddeduction-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CryptidDeductionAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="cryptiddeduction-btn next" onClick={() => dispatch({ type: "next" } as CryptidDeductionAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
