import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonetMemoryState, MonetMemoryAction, MonetMemorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MonetMemoryGame({ state, dispatch, onGameOver }: GameProps<MonetMemoryState, MonetMemorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="monetmem-wrap"><div className="monetmem-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="monetmem-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="monetmem-wrap">
      <div className="monetmem-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="monetmem-score">{state.score} pts</div>
      <div className="monetmem-prompt">{r.question}</div>
      <div className="monetmem-grid">
        {r.choices.map((n, i) => {
          let cls = "monetmem-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as MonetMemoryAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="monetmem-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MonetMemoryAction)}>Submit</button>}
      {state.submitted && <button className="monetmem-btn next" onClick={() => dispatch({ type: "next" } as MonetMemoryAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
