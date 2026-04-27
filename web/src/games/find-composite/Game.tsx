import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FindCompositeState, FindCompositeAction, FindCompositeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function FindCompositeGame({ state, dispatch, onGameOver }: GameProps<FindCompositeState, FindCompositeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="fc2-wrap"><div className="fc2-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {TOTAL_ROUNDS}</div><div className="fc2-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="fc2-wrap">
      <div className="fc2-info">Round {state.currentIndex + 1} / {TOTAL_ROUNDS}</div>
      <div className="fc2-score">{state.score} pts</div>
      <div className="fc2-prompt">Find the composite number</div>
      <div className="fc2-grid">
        {r.numbers.map((n, i) => {
          let cls = "fc2-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FindCompositeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="fc2-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FindCompositeAction)}>Submit</button>}
      {state.submitted && <button className="fc2-btn next" onClick={() => dispatch({ type: "next" } as FindCompositeAction)}>{state.currentIndex + 1 >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>}
    </div>
  );
}
