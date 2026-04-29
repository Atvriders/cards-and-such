import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TheMindCoopState, TheMindCoopAction, TheMindCoopSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TheMindCoopGame({ state, dispatch, onGameOver }: GameProps<TheMindCoopState, TheMindCoopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="themindcoop-wrap">
        <div className="themindcoop-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="themindcoop-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="themindcoop-wrap">
      <div className="themindcoop-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="themindcoop-score">{state.score} pts</span>
      </div>
      <div className="themindcoop-scenario">{p.scenario}</div>
      <ul className="themindcoop-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="themindcoop-options">
        {p.options.map((opt, i) => {
          let cls = "themindcoop-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as TheMindCoopAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="themindcoop-actions">
        {!state.resolved && (
          <button className="themindcoop-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TheMindCoopAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="themindcoop-btn next" onClick={() => dispatch({ type: "next" } as TheMindCoopAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
