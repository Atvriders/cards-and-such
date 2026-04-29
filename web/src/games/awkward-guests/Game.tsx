import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AwkwardGuestsState, AwkwardGuestsAction, AwkwardGuestsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AwkwardGuestsGame({ state, dispatch, onGameOver }: GameProps<AwkwardGuestsState, AwkwardGuestsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="awkwardguests-wrap">
        <div className="awkwardguests-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="awkwardguests-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="awkwardguests-wrap">
      <div className="awkwardguests-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="awkwardguests-score">{state.score} pts</span>
      </div>
      <div className="awkwardguests-scenario">{p.scenario}</div>
      <ul className="awkwardguests-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="awkwardguests-options">
        {p.options.map((opt, i) => {
          let cls = "awkwardguests-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as AwkwardGuestsAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="awkwardguests-actions">
        {!state.resolved && (
          <button className="awkwardguests-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as AwkwardGuestsAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="awkwardguests-btn next" onClick={() => dispatch({ type: "next" } as AwkwardGuestsAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
