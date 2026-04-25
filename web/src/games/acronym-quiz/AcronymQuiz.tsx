import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcronymQuizState, AcronymQuizAction, AcronymQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./AcronymQuiz.css";

export function AcronymQuiz({
  state,
  dispatch,
  onGameOver,
}: GameProps<AcronymQuizState, AcronymQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const entry = state.entries[state.current];

  return (
    <div className="aq-wrap">
      <div className="aq-progress">
        Question {state.current + 1} of {state.entries.length}
      </div>
      <div className="aq-score">Score: {state.score}</div>

      {!state.done && entry ? (
        <>
          <div className="aq-acronym">{entry.acronym}</div>
          <div className="aq-prompt">What does this acronym stand for?</div>
          <div className="aq-choices">
            {entry.choices.map((choice, i) => {
              let cls = "aq-choice";
              if (state.selected !== null) {
                if (choice === entry.answer) cls += " correct";
                else if (state.selected === i) cls += " wrong";
              }
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={state.selected !== null}
                  onClick={() => dispatch({ type: "select", index: i } as AcronymQuizAction)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {state.selected !== null && (
            <button
              className="aq-next"
              onClick={() => dispatch({ type: "next" } as AcronymQuizAction)}
            >
              {state.current + 1 < state.entries.length ? "Next" : "Finish"}
            </button>
          )}
        </>
      ) : (
        <div className="aq-done">
          <h2>Quiz Complete!</h2>
          <div className="aq-final">
            Score: {state.score} / {state.entries.length * 10}
          </div>
        </div>
      )}
    </div>
  );
}
