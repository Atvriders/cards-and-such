import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChineseCuisineQuizState, ChineseCuisineQuizAction, ChineseCuisineQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ChineseCuisineQuiz({ state, dispatch, onGameOver }: GameProps<ChineseCuisineQuizState, ChineseCuisineQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const entry = state.entries[state.current];
  if (state.done) return <div className="cq-wrap"><div className="cq-done"><h2>Quiz Complete!</h2><p className="cq-final">Score: {state.score} / {state.entries.length * 10}</p></div></div>;
  return (
    <div className="cq-wrap">
      <div className="cq-progress">Question {state.current + 1} of {state.entries.length}</div>
      <div className="cq-score">Score: {state.score}</div>
      {entry && <>
        <div className="cq-question">{entry.question}</div>
        <div className="cq-choices">
          {entry.choices.map((c, i) => {
            let cls = "cq-choice";
            if (state.selected !== null) { if (c === entry.answer) cls += " correct"; else if (state.selected === i) cls += " wrong"; }
            return <button key={i} className={cls} disabled={state.selected !== null} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", index:i } as ChineseCuisineQuizAction)}>{c}</button>;
          })}
        </div>
        {state.selected !== null && <button className="cq-next" onClick={() => dispatch({ type:"next" } as ChineseCuisineQuizAction)}>{state.current + 1 < state.entries.length ? "Next" : "Finish"}</button>}
      </>}
    </div>
  );
}
