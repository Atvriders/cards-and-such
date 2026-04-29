import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CinematrixYrState, CinematrixYrAction, CinematrixYrSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CinematrixYrGame({ state, dispatch, onGameOver }: GameProps<CinematrixYrState, CinematrixYrSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gcinema-wrap"><div className="gcinema-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gcinema-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gcinema-wrap">
      <div className="gcinema-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gcinema-score">{state.score} pts</div>
      <div className="gcinema-prompt">{r.question}</div>
      <div className="gcinema-grid">
        {r.choices.map((n, i) => {
          let cls = "gcinema-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CinematrixYrAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gcinema-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CinematrixYrAction)}>Submit</button>}
      {state.submitted && <button className="gcinema-btn next" onClick={() => dispatch({ type: "next" } as CinematrixYrAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
