import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CortexChallenge2State, CortexChallenge2Action, CortexChallenge2Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CortexChallenge2Game({ state, dispatch, onGameOver }: GameProps<CortexChallenge2State, CortexChallenge2Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cortexchallenge2-wrap"><div className="cortexchallenge2-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="cortexchallenge2-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="cortexchallenge2-wrap">
      <div className="cortexchallenge2-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="cortexchallenge2-score">{state.score} pts</div>
      <div className="cortexchallenge2-prompt">{r.question}</div>
      <div className="cortexchallenge2-grid">
        {r.choices.map((n, i) => {
          let cls = "cortexchallenge2-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CortexChallenge2Action)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="cortexchallenge2-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CortexChallenge2Action)}>Submit</button>}
      {state.submitted && <button className="cortexchallenge2-btn next" onClick={() => dispatch({ type: "next" } as CortexChallenge2Action)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
