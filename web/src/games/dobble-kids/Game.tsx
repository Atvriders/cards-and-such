import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DobbleKidsState, DobbleKidsAction, DobbleKidsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DobbleKidsGame({ state, dispatch, onGameOver }: GameProps<DobbleKidsState, DobbleKidsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dobblekids-wrap"><div className="dobblekids-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="dobblekids-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="dobblekids-wrap">
      <div className="dobblekids-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="dobblekids-score">{state.score} pts</div>
      <div className="dobblekids-prompt">{r.question}</div>
      <div className="dobblekids-grid">
        {r.choices.map((n, i) => {
          let cls = "dobblekids-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as DobbleKidsAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="dobblekids-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DobbleKidsAction)}>Submit</button>}
      {state.submitted && <button className="dobblekids-btn next" onClick={() => dispatch({ type: "next" } as DobbleKidsAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
