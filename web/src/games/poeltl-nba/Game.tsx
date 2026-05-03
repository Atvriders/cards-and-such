import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoeltlNbaState, PoeltlNbaAction, PoeltlNbaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PoeltlNbaGame({ state, dispatch, onGameOver }: GameProps<PoeltlNbaState, PoeltlNbaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gpoeltl-wrap"><div className="gpoeltl-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="gpoeltl-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="gpoeltl-wrap">
      <div className="gpoeltl-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="gpoeltl-score">{state.score} pts</div>
      <div className="gpoeltl-prompt">{r.question}</div>
      <div className="gpoeltl-grid">
        {r.choices.map((n, i) => {
          let cls = "gpoeltl-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-poeltl-nba-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as PoeltlNbaAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="gpoeltl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as PoeltlNbaAction)}>Submit</button>}
      {state.submitted && <button className="gpoeltl-btn next" onClick={() => dispatch({ type: "next" } as PoeltlNbaAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
