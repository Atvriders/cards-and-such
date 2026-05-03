import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrainbowState, BrainbowAction, BrainbowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BrainbowGame({ state, dispatch, onGameOver }: GameProps<BrainbowState, BrainbowSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="brnbow-wrap"><div className="brnbow-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="brnbow-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="brnbow-wrap">
      <div className="brnbow-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="brnbow-score">{state.score} pts</div>
      <div className="brnbow-prompt">{r.question}</div>
      <div className="brnbow-grid">
        {r.choices.map((n, i) => {
          let cls = "brnbow-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-brainbow-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as BrainbowAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="brnbow-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BrainbowAction)}>Submit</button>}
      {state.submitted && <button className="brnbow-btn next" onClick={() => dispatch({ type: "next" } as BrainbowAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
