import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IdiomQuizState, IdiomQuizAction, IdiomQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./IdiomQuiz.css";

export function IdiomQuiz({
  state,
  dispatch,
  onGameOver,
}: GameProps<IdiomQuizState, IdiomQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="iq-wrap">
      <div className="iq-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="iq-score">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="iq-idiom">"{entry.idiom}"</div>
          <div className="iq-prompt">What does this idiom mean?</div>
          <div className="iq-choices">
            {entry.choices.map((choice, i) => {
              let cls = "iq-choice";
              if (state.selected !== null) {
                if (choice === entry.answer) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as IdiomQuizAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button
              className="iq-next"
              onClick={() => dispatch({ type: "next" } as IdiomQuizAction)}
            >
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="iq-done">
          <h2>Quiz Complete!</h2>
          <div className="iq-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
