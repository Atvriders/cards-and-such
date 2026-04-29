import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KakerlakenPokerState, KakerlakenPokerAction, KakerlakenPokerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function KakerlakenPokerGame({ state, dispatch, onGameOver }: GameProps<KakerlakenPokerState, KakerlakenPokerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gkakerl-wrap"><div className="gkakerl-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gkakerl-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gkakerl-wrap">
      <div className="gkakerl-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gkakerl-score">{state.score} pts</div>
      <div className="gkakerl-prompt">{r.question}</div>
      <div className="gkakerl-grid">
        {r.choices.map((n, i) => {
          let cls = "gkakerl-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as KakerlakenPokerAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gkakerl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as KakerlakenPokerAction)}>Submit</button>}
      {state.submitted && <button className="gkakerl-btn next" onClick={() => dispatch({ type: "next" } as KakerlakenPokerAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
