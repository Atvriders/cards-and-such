import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumwordMatchState, NumwordMatchAction, NumwordMatchSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NumwordMatchGame({ state, dispatch, onGameOver }: GameProps<NumwordMatchState, NumwordMatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="nw-wrap"><div className="nw-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {TOTAL_ROUNDS}</div><div className="nw-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="nw-wrap">
      <div className="nw-info">Round {state.currentIndex + 1} / {TOTAL_ROUNDS}</div>
      <div className="nw-score">{state.score} pts</div>
      <div className="nw-digit">{r.digit}</div>
      <div className="nw-grid">
        {r.choices.map((c, i) => {
          let cls = "nw-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as NumwordMatchAction)}>{c}</button>;
        })}
      </div>
      {!state.submitted && <button className="nw-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as NumwordMatchAction)}>Submit</button>}
      {state.submitted && <button className="nw-btn next" onClick={() => dispatch({ type: "next" } as NumwordMatchAction)}>{state.currentIndex + 1 >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>}
    </div>
  );
}
