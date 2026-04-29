import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZickeZackeState, ZickeZackeAction, ZickeZackeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ZickeZackeGame({ state, dispatch, onGameOver }: GameProps<ZickeZackeState, ZickeZackeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="zickezacke-wrap"><div className="zickezacke-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="zickezacke-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="zickezacke-wrap">
      <div className="zickezacke-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="zickezacke-score">{state.score} pts</div>
      <div className="zickezacke-prompt">{r.question}</div>
      <div className="zickezacke-grid">
        {r.choices.map((n, i) => {
          let cls = "zickezacke-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as ZickeZackeAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="zickezacke-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ZickeZackeAction)}>Submit</button>}
      {state.submitted && <button className="zickezacke-btn next" onClick={() => dispatch({ type: "next" } as ZickeZackeAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
