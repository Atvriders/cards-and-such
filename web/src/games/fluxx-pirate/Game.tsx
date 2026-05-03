import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxPirateState, FluxxPirateAction, FluxxPirateSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxPirateGame({ state, dispatch, onGameOver }: GameProps<FluxxPirateState, FluxxPirateSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxpira-wrap"><div className="g-fluxpira-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxpira-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxpira-wrap">
      <div className="g-fluxpira-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxpira-score">{state.score} pts</div>
      <div className="g-fluxpira-prompt">{r.question}</div>
      <div className="g-fluxpira-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxpira-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-fluxx-pirate-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxPirateAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxpira-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxPirateAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxpira-btn next" onClick={() => dispatch({ type: "next" } as FluxxPirateAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
