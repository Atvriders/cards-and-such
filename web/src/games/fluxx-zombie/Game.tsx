import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxZombieState, FluxxZombieAction, FluxxZombieSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxZombieGame({ state, dispatch, onGameOver }: GameProps<FluxxZombieState, FluxxZombieSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxzomb-wrap"><div className="g-fluxzomb-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxzomb-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxzomb-wrap">
      <div className="g-fluxzomb-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxzomb-score">{state.score} pts</div>
      <div className="g-fluxzomb-prompt">{r.question}</div>
      <div className="g-fluxzomb-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxzomb-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-fluxx-zombie-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxZombieAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxzomb-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxZombieAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxzomb-btn next" onClick={() => dispatch({ type: "next" } as FluxxZombieAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
