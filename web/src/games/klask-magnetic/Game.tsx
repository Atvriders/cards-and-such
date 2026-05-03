import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlaskMagneticState, KlaskMagneticAction, KlaskMagneticSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KlaskMagneticGame({ state, dispatch, onGameOver }: GameProps<KlaskMagneticState, KlaskMagneticSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gklaskm-wrap"><div className="gklaskm-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gklaskm-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gklaskm-wrap">
      <div className="gklaskm-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gklaskm-score">{state.score} pts</div>
      <div className="gklaskm-prompt">{r.question}</div>
      <div className="gklaskm-grid">
        {r.choices.map((n, i) => {
          let cls = "gklaskm-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-klask-magnetic-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as KlaskMagneticAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gklaskm-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as KlaskMagneticAction)}>Submit</button>}
      {state.submitted && <button className="gklaskm-btn next" onClick={() => dispatch({ type: "next" } as KlaskMagneticAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
