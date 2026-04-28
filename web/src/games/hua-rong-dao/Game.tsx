import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HuaRongDaoState, HuaRongDaoAction, HuaRongDaoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HuaRongDaoGame({ state, dispatch, onGameOver }: GameProps<HuaRongDaoState, HuaRongDaoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="ded-wrap">
        <div className="ded-done">
          <h2>Case Closed</h2>
          <p>Solved: {state.correctCount} / {state.puzzles.length}</p>
          <p className="ded-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const p = state.puzzles[state.currentIndex]!;
  return (
    <div className="ded-wrap">
      <div className="ded-header">
        <span>Puzzle {state.currentIndex + 1} / {state.puzzles.length}</span>
        <span className="ded-score">{state.score} pts</span>
      </div>
      <div className="ded-scenario">{p.scenario}</div>
      <ul className="ded-clues">
        {p.clues.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <div className="ded-options">
        {p.options.map((opt, i) => {
          let cls = "ded-option";
          if (state.resolved) {
            if (i === p.correctIndex) cls += " correct";
            else if (i === state.selected) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={state.resolved} onClick={() => dispatch({ type: "select", index: i } as HuaRongDaoAction)}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="ded-actions">
        {!state.resolved && (
          <button className="ded-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as HuaRongDaoAction)}>Accuse!</button>
        )}
        {state.resolved && (
          <button className="ded-btn next" onClick={() => dispatch({ type: "next" } as HuaRongDaoAction)}>
            {state.currentIndex + 1 >= state.puzzles.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
