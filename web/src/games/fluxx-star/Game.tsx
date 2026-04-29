import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FluxxStarState, FluxxStarAction, FluxxStarSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FluxxStarGame({ state, dispatch, onGameOver }: GameProps<FluxxStarState, FluxxStarSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-fluxstar-wrap"><div className="g-fluxstar-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-fluxstar-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-fluxstar-wrap">
      <div className="g-fluxstar-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-fluxstar-score">{state.score} pts</div>
      <div className="g-fluxstar-prompt">{r.question}</div>
      <div className="g-fluxstar-grid">
        {r.choices.map((n, i) => {
          let c = "g-fluxstar-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as FluxxStarAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-fluxstar-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as FluxxStarAction)}>Submit</button>}
      {state.submitted && <button className="g-fluxstar-btn next" onClick={() => dispatch({ type: "next" } as FluxxStarAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
