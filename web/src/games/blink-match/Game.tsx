import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlinkMatchState, BlinkMatchAction, BlinkMatchSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BlinkMatchGame({ state, dispatch, onGameOver }: GameProps<BlinkMatchState, BlinkMatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="blnkmtc-wrap"><div className="blnkmtc-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="blnkmtc-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="blnkmtc-wrap">
      <div className="blnkmtc-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="blnkmtc-score">{state.score} pts</div>
      <div className="blnkmtc-prompt">{r.question}</div>
      <div className="blnkmtc-grid">
        {r.choices.map((n, i) => {
          let cls = "blnkmtc-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as BlinkMatchAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="blnkmtc-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BlinkMatchAction)}>Submit</button>}
      {state.submitted && <button className="blnkmtc-btn next" onClick={() => dispatch({ type: "next" } as BlinkMatchAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
