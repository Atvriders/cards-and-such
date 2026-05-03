import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CheatingMothCardState, CheatingMothCardAction, CheatingMothCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CheatingMothCardGame({ state, dispatch, onGameOver }: GameProps<CheatingMothCardState, CheatingMothCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-cheamothcard-wrap"><div className="g-cheamothcard-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-cheamothcard-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-cheamothcard-wrap">
      <div className="g-cheamothcard-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-cheamothcard-score">{state.score} pts</div>
      <div className="g-cheamothcard-prompt">{r.question}</div>
      <div className="g-cheamothcard-grid">
        {r.choices.map((n, i) => {
          let c = "g-cheamothcard-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-cheating-moth-card-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CheatingMothCardAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-cheamothcard-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CheatingMothCardAction)}>Submit</button>}
      {state.submitted && <button className="g-cheamothcard-btn next" onClick={() => dispatch({ type: "next" } as CheatingMothCardAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
