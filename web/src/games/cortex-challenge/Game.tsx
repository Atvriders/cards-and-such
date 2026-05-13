import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CortexChallengeState, CortexChallengeAction, CortexChallengeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CortexChallengeGame({ state, dispatch, onGameOver }: GameProps<CortexChallengeState, CortexChallengeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="crtxch-wrap"><div className="crtxch-done bounce-in"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="crtxch-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="crtxch-wrap fade-in">
      <div className="crtxch-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="crtxch-score pulse">{state.score} pts</div>
      <div className="crtxch-prompt">{r.question}</div>
      <div className="crtxch-grid">
        {r.choices.map((n, i) => {
          let cls = "crtxch-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as CortexChallengeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="crtxch-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CortexChallengeAction)}>Submit</button>}
      {state.submitted && <button className="crtxch-btn next" onClick={() => dispatch({ type: "next" } as CortexChallengeAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
