import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarryBoffKillState, MarryBoffKillAction, MarryBoffKillSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MarryBoffKillGame({ state, dispatch, onGameOver }: GameProps<MarryBoffKillState, MarryBoffKillSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-marrboffkill-wrap"><div className="g-marrboffkill-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-marrboffkill-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-marrboffkill-wrap">
      <div className="g-marrboffkill-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-marrboffkill-score">{state.score} pts</div>
      <div className="g-marrboffkill-prompt">{r.question}</div>
      <div className="g-marrboffkill-grid">
        {r.choices.map((n, i) => {
          let c = "g-marrboffkill-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-marry-boff-kill-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as MarryBoffKillAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-marrboffkill-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as MarryBoffKillAction)}>Submit</button>}
      {state.submitted && <button className="g-marrboffkill-btn next" onClick={() => dispatch({ type: "next" } as MarryBoffKillAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
