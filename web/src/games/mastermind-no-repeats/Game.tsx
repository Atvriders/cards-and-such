import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MastermindNoRepeatsState, MastermindNoRepeatsAction, MastermindNoRepeatsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MastermindNoRepeatsGame({ state, dispatch, onGameOver }: GameProps<MastermindNoRepeatsState, MastermindNoRepeatsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mastermindnorepeats-wrap">
        <div className="mastermindnorepeats-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="mastermindnorepeats-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="mastermindnorepeats-wrap">
      <div className="mastermindnorepeats-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="mastermindnorepeats-score">{state.score} pts</span>
      </div>
      <div className="mastermindnorepeats-scenario">{p.scenario}</div>
      <ul className="mastermindnorepeats-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="mastermindnorepeats-options">
        {p.options.map((opt, i) => {
          let cls = "mastermindnorepeats-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as MastermindNoRepeatsAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mastermindnorepeats-actions">
        {!state.resolved && (
          <button className="mastermindnorepeats-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MastermindNoRepeatsAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="mastermindnorepeats-btn next" onClick={() => dispatch({ type: "next" } as MastermindNoRepeatsAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
