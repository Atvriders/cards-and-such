import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MysteryAbbeyState, MysteryAbbeyAction, MysteryAbbeySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MysteryAbbeyGame({ state, dispatch, onGameOver }: GameProps<MysteryAbbeyState, MysteryAbbeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="mysteryabbey-wrap">
        <div className="mysteryabbey-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="mysteryabbey-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="mysteryabbey-wrap">
      <div className="mysteryabbey-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="mysteryabbey-score">{state.score} pts</span>
      </div>
      <div className="mysteryabbey-scenario">{p.scenario}</div>
      <ul className="mysteryabbey-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="mysteryabbey-options">
        {p.options.map((opt, i) => {
          let cls = "mysteryabbey-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as MysteryAbbeyAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mysteryabbey-actions">
        {!state.resolved && (
          <button className="mysteryabbey-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MysteryAbbeyAction)}>Submit</button>
        )}
        {state.resolved && (
          <button className="mysteryabbey-btn next" onClick={() => dispatch({ type: "next" } as MysteryAbbeyAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
