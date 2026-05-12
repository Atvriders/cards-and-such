import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DrunkStonedStupidState, DrunkStonedStupidAction, DrunkStonedStupidSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DrunkStonedStupidGame({ state, dispatch, onGameOver }: GameProps<DrunkStonedStupidState, DrunkStonedStupidSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="g-drunstonstup-wrap"><div className="g-drunstonstup-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="g-drunstonstup-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="g-drunstonstup-wrap fade-in">
      <div className="g-drunstonstup-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="g-drunstonstup-score pulse">{state.score} pts</div>
      <div className="g-drunstonstup-prompt">{r.question}</div>
      <div className="g-drunstonstup-grid">
        {r.choices.map((n, i) => {
          let c = "g-drunstonstup-cell";
          if (state.submitted) {
            if (i === r.correct) c += " correct";
            else if (i === state.selected && state.selected !== r.correct) c += " wrong";
          } else if (i === state.selected) c += " selected";
          return <button data-testid={`hint-target-drunk-stoned-stupid-answer-${i}`} key={i} className={c} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as DrunkStonedStupidAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="g-drunstonstup-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DrunkStonedStupidAction)}>Submit</button>}
      {state.submitted && <button className="g-drunstonstup-btn next" onClick={() => dispatch({ type: "next" } as DrunkStonedStupidAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
