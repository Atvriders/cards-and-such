import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Mastermind6peg10colorState, Mastermind6peg10colorAction, Mastermind6peg10colorSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Mastermind6peg10colorGame({ state, dispatch, onGameOver }: GameProps<Mastermind6peg10colorState, Mastermind6peg10colorSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mastermind6peg10color-wrap">
        <div className="mastermind6peg10color-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="mastermind6peg10color-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="mastermind6peg10color-wrap">
      <div className="mastermind6peg10color-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="mastermind6peg10color-score">{state.score} pts</span>
      </div>
      <div className="mastermind6peg10color-scenario">{p.scenario}</div>
      <ul className="mastermind6peg10color-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="mastermind6peg10color-options">
        {p.options.map((opt, i) => {
          let cls = "mastermind6peg10color-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as Mastermind6peg10colorAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mastermind6peg10color-actions">
        {!state.resolved && (
          <button className="mastermind6peg10color-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as Mastermind6peg10colorAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="mastermind6peg10color-btn next" onClick={() => dispatch({ type: "next" } as Mastermind6peg10colorAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
