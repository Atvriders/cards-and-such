import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpyfallTimeTravelState, SpyfallTimeTravelAction, SpyfallTimeTravelSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpyfallTimeTravelGame({ state, dispatch, onGameOver }: GameProps<SpyfallTimeTravelState, SpyfallTimeTravelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="spyfalltimetravel-wrap">
        <div className="spyfalltimetravel-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="spyfalltimetravel-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="spyfalltimetravel-wrap">
      <div className="spyfalltimetravel-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="spyfalltimetravel-score">{state.score} pts</span>
      </div>
      <div className="spyfalltimetravel-scenario">{p.scenario}</div>
      <ul className="spyfalltimetravel-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="spyfalltimetravel-options">
        {p.options.map((opt, i) => {
          let cls = "spyfalltimetravel-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as SpyfallTimeTravelAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="spyfalltimetravel-actions">
        {!state.resolved && (
          <button className="spyfalltimetravel-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpyfallTimeTravelAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="spyfalltimetravel-btn next" onClick={() => dispatch({ type: "next" } as SpyfallTimeTravelAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
