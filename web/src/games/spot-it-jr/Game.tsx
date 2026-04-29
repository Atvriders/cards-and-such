import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItJrState, SpotItJrAction, SpotItJrSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItJrGame({ state, dispatch, onGameOver }: GameProps<SpotItJrState, SpotItJrSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="spotitjr-wrap"><div className="spotitjr-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="spotitjr-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="spotitjr-wrap">
      <div className="spotitjr-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="spotitjr-score">{state.score} pts</div>
      <div className="spotitjr-prompt">{r.question}</div>
      <div className="spotitjr-grid">
        {r.choices.map((n, i) => {
          let cls = "spotitjr-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpotItJrAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="spotitjr-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpotItJrAction)}>Submit</button>}
      {state.submitted && <button className="spotitjr-btn next" onClick={() => dispatch({ type: "next" } as SpotItJrAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
