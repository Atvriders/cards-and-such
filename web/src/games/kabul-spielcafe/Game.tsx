import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KabulSpielcafeState, KabulSpielcafeAction, KabulSpielcafeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KabulSpielcafeGame({ state, dispatch, onGameOver }: GameProps<KabulSpielcafeState, KabulSpielcafeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="kabulspielcafe-wrap">
        <div className="kabulspielcafe-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="kabulspielcafe-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="kabulspielcafe-wrap">
      <div className="kabulspielcafe-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="kabulspielcafe-score">{state.score} pts</span>
      </div>
      <div className="kabulspielcafe-scenario">{p.scenario}</div>
      <ul className="kabulspielcafe-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="kabulspielcafe-options">
        {p.options.map((opt, i) => {
          let cls = "kabulspielcafe-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as KabulSpielcafeAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="kabulspielcafe-actions">
        {!state.resolved && (
          <button className="kabulspielcafe-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as KabulSpielcafeAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="kabulspielcafe-btn next" onClick={() => dispatch({ type: "next" } as KabulSpielcafeAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
