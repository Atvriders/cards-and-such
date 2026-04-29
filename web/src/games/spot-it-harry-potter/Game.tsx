import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItHarryPotterState, SpotItHarryPotterAction, SpotItHarryPotterSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItHarryPotterGame({ state, dispatch, onGameOver }: GameProps<SpotItHarryPotterState, SpotItHarryPotterSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="spotitharrypotter-wrap"><div className="spotitharrypotter-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="spotitharrypotter-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="spotitharrypotter-wrap">
      <div className="spotitharrypotter-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="spotitharrypotter-score">{state.score} pts</div>
      <div className="spotitharrypotter-prompt">{r.question}</div>
      <div className="spotitharrypotter-grid">
        {r.choices.map((n, i) => {
          let cls = "spotitharrypotter-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpotItHarryPotterAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="spotitharrypotter-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpotItHarryPotterAction)}>Submit</button>}
      {state.submitted && <button className="spotitharrypotter-btn next" onClick={() => dispatch({ type: "next" } as SpotItHarryPotterAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
