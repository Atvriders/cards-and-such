import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwishCardsState, SwishCardsAction, SwishCardsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SwishCardsGame({ state, dispatch, onGameOver }: GameProps<SwishCardsState, SwishCardsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="swshcrd-wrap"><div className="swshcrd-done"><h2>Done!</h2><div>Correct: {state.correctCount} / {state.rounds.length}</div><div className="swshcrd-final">{state.score} pts</div></div></div>;
  }
  const r = state.rounds[state.currentIndex]!;
  return (
    <div className="swshcrd-wrap">
      <div className="swshcrd-info">Round {state.currentIndex + 1} / {state.rounds.length}</div>
      <div className="swshcrd-score">{state.score} pts</div>
      <div className="swshcrd-prompt">{r.question}</div>
      <div className="swshcrd-grid">
        {r.choices.map((n, i) => {
          let cls = "swshcrd-cell";
          if (state.submitted) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-swish-cards-answer-${i}`} key={i} className={cls} disabled={state.submitted} onClick={() => dispatch({ type: "select", choice: i } as SwishCardsAction)}>{n}</button>;
        })}
      </div>
      {!state.submitted && <button className="swshcrd-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SwishCardsAction)}>Submit</button>}
      {state.submitted && <button className="swshcrd-btn next" onClick={() => dispatch({ type: "next" } as SwishCardsAction)}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>}
    </div>
  );
}
