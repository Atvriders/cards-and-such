import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LewdleCleanState, LewdleCleanAction, LewdleCleanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LewdleCleanGame({ state, dispatch, onGameOver }: GameProps<LewdleCleanState, LewdleCleanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-lewdclea-wrap"><div className="g-lewdclea-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-lewdclea-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-lewdclea-wrap">
      <div className="g-lewdclea-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-lewdclea-score">{state.score} pts</div>
      <div className="g-lewdclea-prompt">{r.question}</div>
      <div className="g-lewdclea-grid">
        {r.choices.map((n, i) => {
          let c = "g-lewdclea-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as LewdleCleanAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-lewdclea-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as LewdleCleanAction)}>Submit</button>}
      {state.submitted && <button className="g-lewdclea-btn next" onClick={() => dispatch({ type: "next" } as LewdleCleanAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
