import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CategoryQuizState, CategoryQuizAction, CategoryQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CategoryQuiz.css";

export function CategoryQuiz({
  state,
  dispatch,
  onGameOver,
}: GameProps<CategoryQuizState, CategoryQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const q = state.questions[state.currentIndex];
  if (!q) return <div className="cq-wrap">Loading...</div>;

  const { confirmed, selectedOption, score } = state;

  const isCorrect = confirmed && selectedOption === q.correctIndex;
  const isWrong = confirmed && selectedOption !== q.correctIndex;

  return (
    <div className="cq-wrap">
      <div className="cq-progress">
        Question {state.currentIndex + 1} / {state.questions.length} &mdash; Score: {score}
      </div>

      <div className="cq-category">{q.category}</div>

      <div className="cq-question">{q.question}</div>

      <div className="cq-options">
        {q.options.map((opt, i) => {
          let cls = "cq-option";
          if (confirmed) {
            if (i === q.correctIndex) cls += " correct";
            else if (i === selectedOption) cls += " wrong";
          } else if (i === selectedOption) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={confirmed}
              onClick={() => dispatch({ type: "select", optionIndex: i } as CategoryQuizAction)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className={`cq-feedback${isCorrect ? " correct" : isWrong ? " wrong" : ""}`}>
        {isCorrect ? "Correct! +10 points" : isWrong ? `Wrong! Answer: ${q.options[q.correctIndex]}` : ""}
      </div>

      <div className="cq-buttons">
        {!confirmed && (
          <button
            className="cq-btn cq-btn-confirm"
            disabled={selectedOption === null}
            onClick={() => dispatch({ type: "confirm" } as CategoryQuizAction)}
          >
            Confirm
          </button>
        )}
        {confirmed && (
          <button
            className="cq-btn cq-btn-next"
            onClick={() => dispatch({ type: "next" } as CategoryQuizAction)}
          >
            {state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}
          </button>
        )}
      </div>

      {terminal && (
        <div className="cq-overlay">
          <div className="cq-overlay-box">
            <h2>Quiz Complete!</h2>
            <div className="cq-final-score">
              Score: {terminal.score} / {state.questions.length * 10}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
