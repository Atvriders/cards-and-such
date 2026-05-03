import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TaylordleSwiftState, TaylordleSwiftAction, TaylordleSwiftSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TaylordleSwiftGame({ state, dispatch, onGameOver }: GameProps<TaylordleSwiftState, TaylordleSwiftSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-taylswif-wrap"><div className="g-taylswif-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-taylswif-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-taylswif-wrap">
      <div className="g-taylswif-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-taylswif-score">{state.score} pts</div>
      <div className="g-taylswif-prompt">{r.question}</div>
      <div className="g-taylswif-grid">
        {r.choices.map((n, i) => {
          let c = "g-taylswif-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-taylordle-swift-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as TaylordleSwiftAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-taylswif-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TaylordleSwiftAction)}>Submit</button>}
      {state.submitted && <button className="g-taylswif-btn next" onClick={() => dispatch({ type: "next" } as TaylordleSwiftAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
