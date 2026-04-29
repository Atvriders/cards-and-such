import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimonAirState, SimonAirAction, SimonAirSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SimonAirGame({ state, dispatch, onGameOver }: GameProps<SimonAirState, SimonAirSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="simonair-wrap"><div className="simonair-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="simonair-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="simonair-wrap">
      <div className="simonair-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="simonair-score">{state.score} pts</div>
      <div className="simonair-prompt">{r.question}</div>
      <div className="simonair-grid">
        {r.choices.map((n, i) => {
          let cls = "simonair-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SimonAirAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="simonair-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SimonAirAction)}>Submit</button>}
      {state.submitted && <button className="simonair-btn next" onClick={() => dispatch({ type: "next" } as SimonAirAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
