import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItSplashState, SpotItSplashAction, SpotItSplashSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItSplashGame({ state, dispatch, onGameOver }: GameProps<SpotItSplashState, SpotItSplashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="spotitsplash-wrap"><div className="spotitsplash-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="spotitsplash-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="spotitsplash-wrap">
      <div className="spotitsplash-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="spotitsplash-score">{state.score} pts</div>
      <div className="spotitsplash-prompt">{r.question}</div>
      <div className="spotitsplash-grid">
        {r.choices.map((n, i) => {
          let cls = "spotitsplash-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SpotItSplashAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="spotitsplash-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpotItSplashAction)}>Submit</button>}
      {state.submitted && <button className="spotitsplash-btn next" onClick={() => dispatch({ type: "next" } as SpotItSplashAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
