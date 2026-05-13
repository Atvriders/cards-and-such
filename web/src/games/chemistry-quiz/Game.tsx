import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChemistryQuizState } from "./state.js";
import { isTerminal } from "./state.js";
import type { chemistryQuizSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type ChemistryQuizSettingsType = SettingsOf<typeof chemistryQuizSettings>;

const LABELS = ["A", "B", "C", "D"];

export function ChemistryQuizGame({ state, dispatch, onGameOver }: GameProps<ChemistryQuizState, ChemistryQuizSettingsType>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (terminal) {
    return (
      <div className="cq-wrap">
        <div className="cq-done bounce-in">
          <h2>Done!</h2>
          <p>Score: <strong>{terminal.score}</strong> &middot; {state.correctCount}/{state.questions.length} correct</p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.currentIndex]!;
  const total = state.questions.length;
  const pct = (state.currentIndex / total) * 100;
  const isResult = state.submitted;

  return (
    <div className="cq-wrap fade-in">
      <div className="cq-header">
        <span>Q <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="cq-progress-bar">
        <div className="cq-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="cq-question">{q.question}</div>

      <div className="cq-choices">
        {q.choices.map((choice, i) => {
          let cls = "cq-choice";
          if (isResult) {
            if (i === q.correctIndex) cls += " correct";
            else if (i === state.selected && state.selected !== q.correctIndex) cls += " wrong";
          } else if (i === state.selected) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={isResult}
              data-testid={`hint-target-quiz-answer-${i}`}
              onClick={() => dispatch({ type: "select", index: i })}
            >
              <span className="cq-choice-letter">{LABELS[i]}</span>
              {choice}
            </button>
          );
        })}
      </div>

      {isResult && (
        <div className={`cq-feedback ${state.selected === q.correctIndex ? "correct" : "wrong"}`}>
          {state.selected === q.correctIndex ? "Correct! +10" : `Wrong! Answer: ${q.choices[q.correctIndex]}`}
        </div>
      )}

      <div className="cq-actions">
        {!isResult && (
          <button className="cq-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" })}>
            Submit
          </button>
        )}
        {isResult && (
          <button className="cq-btn next" onClick={() => dispatch({ type: "next" })}>
            {state.currentIndex + 1 >= total ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
