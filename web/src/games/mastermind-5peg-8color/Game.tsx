import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Mastermind5peg8colorState, Mastermind5peg8colorAction, Mastermind5peg8colorSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Mastermind5peg8colorGame({ state, dispatch, onGameOver }: GameProps<Mastermind5peg8colorState, Mastermind5peg8colorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mastermind5peg8color-wrap">
        <div className="mastermind5peg8color-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="mastermind5peg8color-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="mastermind5peg8color-wrap">
      <div className="mastermind5peg8color-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="mastermind5peg8color-score">{state.score} pts</span>
      </div>
      <div className="mastermind5peg8color-scenario">{p.scenario}</div>
      <ul className="mastermind5peg8color-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="mastermind5peg8color-options">
        {p.options.map((opt, i) => {
          let cls = "mastermind5peg8color-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as Mastermind5peg8colorAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mastermind5peg8color-actions">
        {!state.resolved && (
          <button className="mastermind5peg8color-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as Mastermind5peg8colorAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="mastermind5peg8color-btn next" onClick={() => dispatch({ type: "next" } as Mastermind5peg8colorAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
