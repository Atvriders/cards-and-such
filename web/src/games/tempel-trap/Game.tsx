import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TempelTrapState, TempelTrapAction, TempelTrapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TempelTrapGame({ state, dispatch, onGameOver }: GameProps<TempelTrapState, TempelTrapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="tempeltrap-wrap">
        <div className="tempeltrap-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="tempeltrap-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="tempeltrap-wrap">
      <div className="tempeltrap-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="tempeltrap-score">{state.score} pts</span>
      </div>
      <div className="tempeltrap-scenario">{p.scenario}</div>
      <ul className="tempeltrap-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="tempeltrap-options">
        {p.options.map((opt, i) => {
          let cls = "tempeltrap-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as TempelTrapAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="tempeltrap-actions">
        {!state.resolved && (
          <button className="tempeltrap-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TempelTrapAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="tempeltrap-btn next" onClick={() => dispatch({ type: "next" } as TempelTrapAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
