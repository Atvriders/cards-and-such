import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HashiwokakeroMiniState, HashiwokakeroMiniAction, HashiwokakeroMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HashiwokakeroMiniGame({ state, dispatch, onGameOver }: GameProps<HashiwokakeroMiniState, HashiwokakeroMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="hashiwokakeroteal-wrap">
        <div className="hashiwokakeroteal-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="hashiwokakeroteal-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="hashiwokakeroteal-wrap">
      <div className="hashiwokakeroteal-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="hashiwokakeroteal-score">{state.score} pts</span>
      </div>
      <div className="hashiwokakeroteal-scenario">{p.scenario}</div>
      <ul className="hashiwokakeroteal-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="hashiwokakeroteal-options">
        {p.options.map((opt, i) => {
          let cls = "hashiwokakeroteal-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as HashiwokakeroMiniAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="hashiwokakeroteal-actions">
        {!state.resolved && (
          <button className="hashiwokakeroteal-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as HashiwokakeroMiniAction)}>Accuse!</button>
        )}
        {state.resolved && (
          <button className="hashiwokakeroteal-btn next" onClick={() => dispatch({ type: "next" } as HashiwokakeroMiniAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
