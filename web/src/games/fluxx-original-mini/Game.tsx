import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxOriginalMiniState, FluxxOriginalMiniAction, FluxxOriginalMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxOriginalMiniGame({ state, dispatch, onGameOver }: GameProps<FluxxOriginalMiniState, FluxxOriginalMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxorigmini-wrap"><div className="g-fluxorigmini-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxorigmini-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxorigmini-wrap">
      <div className="g-fluxorigmini-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxorigmini-score">{state.score} pts</div>
      <div className="g-fluxorigmini-prompt">{r.question}</div>
      <div className="g-fluxorigmini-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxorigmini-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-fluxx-original-mini-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxOriginalMiniAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxorigmini-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxOriginalMiniAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxorigmini-btn next" onClick={() => dispatch({ type: "next" } as FluxxOriginalMiniAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
