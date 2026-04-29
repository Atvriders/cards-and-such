import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItDinoState, SpotItDinoAction, SpotItDinoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItDinoGame({ state, dispatch, onGameOver }: GameProps<SpotItDinoState, SpotItDinoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="spotitdino-wrap"><div className="spotitdino-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="spotitdino-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="spotitdino-wrap">
      <div className="spotitdino-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="spotitdino-score">{state.score} pts</div>
      <div className="spotitdino-prompt">{r.question}</div>
      <div className="spotitdino-grid">
        {r.choices.map((n, i) => {
          let cls = "spotitdino-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpotItDinoAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="spotitdino-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpotItDinoAction)}>Submit</button>}
      {state.submitted && <button className="spotitdino-btn next" onClick={() => dispatch({ type: "next" } as SpotItDinoAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
