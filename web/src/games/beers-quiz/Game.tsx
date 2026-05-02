import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeersQuizState, BeersQuizAction, BeersQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BeersQuiz({
  state,
  dispatch,
  onGameOver,
}: GameProps<BeersQuizState, BeersQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="qz-wrap">
      <div className="qz-progress">Question {state.current + 1} of {state.entries.length}</div>
      <div className="qz-score">Score: {state.score}</div>
      {!state.done && entry ? (
        <>
          <div className="qz-question">{entry.question}</div>
          <div className="qz-choices">
            {entry.choices.map((choice, i) => {
              let cls = "qz-choice";
              if (state.selected !== null) {
                if (choice === entry.answer) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  data-testid={`hint-target-quiz-answer-${i}`}
                  onClick={() => dispatch({ type: "select", index: i } as BeersQuizAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button className="qz-next" onClick={() => dispatch({ type: "next" } as BeersQuizAction)}>
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="qz-done">
          <h2>Quiz Complete!</h2>
          <div className="qz-final">Score: {state.score} / {state.entries.length * 10}</div>
        </div>
      )}
    </div>
  );
}
