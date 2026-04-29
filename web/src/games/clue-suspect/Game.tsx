import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClueSuspectState, ClueSuspectAction, ClueSuspectSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ClueSuspectGame({ state, dispatch, onGameOver }: GameProps<ClueSuspectState, ClueSuspectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="cluesuspect-wrap">
        <div className="cluesuspect-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="cluesuspect-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="cluesuspect-wrap">
      <div className="cluesuspect-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="cluesuspect-score">{state.score} pts</span>
      </div>
      <div className="cluesuspect-scenario">{p.scenario}</div>
      <ul className="cluesuspect-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="cluesuspect-options">
        {p.options.map((opt, i) => {
          let cls = "cluesuspect-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as ClueSuspectAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="cluesuspect-actions">
        {!state.resolved && (
          <button className="cluesuspect-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ClueSuspectAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="cluesuspect-btn next" onClick={() => dispatch({ type: "next" } as ClueSuspectAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
