import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxCthulhuState, FluxxCthulhuAction, FluxxCthulhuSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxCthulhuGame({ state, dispatch, onGameOver }: GameProps<FluxxCthulhuState, FluxxCthulhuSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxcthu-wrap"><div className="g-fluxcthu-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxcthu-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxcthu-wrap">
      <div className="g-fluxcthu-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxcthu-score">{state.score} pts</div>
      <div className="g-fluxcthu-prompt">{r.question}</div>
      <div className="g-fluxcthu-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxcthu-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-fluxx-cthulhu-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxCthulhuAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxcthu-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxCthulhuAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxcthu-btn next" onClick={() => dispatch({ type: "next" } as FluxxCthulhuAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
