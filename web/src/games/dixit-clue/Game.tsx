import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DixitClueState, DixitClueAction, DixitClueSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DixitClueGame({ state, dispatch, onGameOver }: GameProps<DixitClueState, DixitClueSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dixitclue-wrap">
        <div className="dixitclue-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="dixitclue-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="dixitclue-wrap">
      <div className="dixitclue-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="dixitclue-score">{state.score} pts</span>
      </div>
      <div className="dixitclue-scenario">{p.scenario}</div>
      <ul className="dixitclue-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="dixitclue-options">
        {p.options.map((opt, i) => {
          let cls = "dixitclue-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as DixitClueAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="dixitclue-actions">
        {!state.resolved && (
          <button className="dixitclue-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DixitClueAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="dixitclue-btn next" onClick={() => dispatch({ type: "next" } as DixitClueAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
