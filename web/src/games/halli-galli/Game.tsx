import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HalliGalliState, HalliGalliAction, HalliGalliSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HalliGalliGame({ state, dispatch, onGameOver }: GameProps<HalliGalliState, HalliGalliSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="hgalli-wrap"><div className="hgalli-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="hgalli-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="hgalli-wrap">
      <div className="hgalli-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="hgalli-score">{state.score} pts</div>
      <div className="hgalli-prompt">{r.question}</div>
      <div className="hgalli-grid">
        {r.choices.map((n, i) => {
          let cls = "hgalli-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-halli-galli-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as HalliGalliAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="hgalli-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as HalliGalliAction)}>Submit</button>}
      {state.submitted && <button className="hgalli-btn next" onClick={() => dispatch({ type: "next" } as HalliGalliAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
