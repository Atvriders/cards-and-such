import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlagsMemoryState, FlagsMemoryAction, FlagsMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FlagsMemoryGame({ state, dispatch, onGameOver }: GameProps<FlagsMemoryState, FlagsMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gflagsm-wrap"><div className="gflagsm-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gflagsm-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gflagsm-wrap">
      <div className="gflagsm-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gflagsm-score">{state.score} pts</div>
      <div className="gflagsm-prompt">{r.question}</div>
      <div className="gflagsm-grid">
        {r.choices.map((n, i) => {
          let cls = "gflagsm-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FlagsMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gflagsm-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FlagsMemoryAction)}>Submit</button>}
      {state.submitted && <button className="gflagsm-btn next" onClick={() => dispatch({ type: "next" } as FlagsMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
