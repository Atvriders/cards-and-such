import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WheresWaldoCardState, WheresWaldoCardAction, WheresWaldoCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function WheresWaldoCardGame({ state, dispatch, onGameOver }: GameProps<WheresWaldoCardState, WheresWaldoCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="wldcard-wrap"><div className="wldcard-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="wldcard-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="wldcard-wrap">
      <div className="wldcard-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="wldcard-score">{state.score} pts</div>
      <div className="wldcard-prompt">{r.question}</div>
      <div className="wldcard-grid">
        {r.choices.map((n, i) => {
          let cls = "wldcard-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-wheres-waldo-card-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as WheresWaldoCardAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="wldcard-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as WheresWaldoCardAction)}>Submit</button>}
      {state.submitted && <button className="wldcard-btn next" onClick={() => dispatch({ type: "next" } as WheresWaldoCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
