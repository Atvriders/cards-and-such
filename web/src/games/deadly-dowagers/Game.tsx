import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DeadlyDowagersState, DeadlyDowagersAction, DeadlyDowagersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DeadlyDowagersGame({ state, dispatch, onGameOver }: GameProps<DeadlyDowagersState, DeadlyDowagersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="deadlydowagers-wrap">
        <div className="deadlydowagers-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="deadlydowagers-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="deadlydowagers-wrap">
      <div className="deadlydowagers-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="deadlydowagers-score">{state.score} pts</span>
      </div>
      <div className="deadlydowagers-scenario">{p.scenario}</div>
      <ul className="deadlydowagers-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="deadlydowagers-options">
        {p.options.map((opt, i) => {
          let cls = "deadlydowagers-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as DeadlyDowagersAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="deadlydowagers-actions">
        {!state.resolved && (
          <button className="deadlydowagers-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DeadlyDowagersAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="deadlydowagers-btn next" onClick={() => dispatch({ type: "next" } as DeadlyDowagersAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
