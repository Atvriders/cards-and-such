import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClueMiniState, ClueMiniAction, ClueMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function ClueMiniGame({ state, dispatch, onGameOver }: GameProps<ClueMiniState, ClueMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="quiz-wrap">
        <div className="quiz-done">
          <h2>Done!</h2>
          <p>Correct: {state.correctCount} / {state.questions.length}</p>
          <p className="quiz-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  return (
    <div className="quiz-wrap">
      <div className="quiz-header">
        <span>Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className="quiz-score">{state.score} pts</span>
      </div>
      <div className="quiz-question">{q.question}</div>
      <div className="quiz-choices">
        {q.choices.map((choice, i) => {
          let cls = "quiz-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as ClueMiniAction)}>
              <span className="quiz-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`quiz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>
          {state.selected === q.correct ? "Correct!" : `Answer: ${q.choices[q.correct]}`}
        </div>
      )}
      <div className="quiz-actions">
        {!isResult && (
          <button className="quiz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ClueMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="quiz-btn next" onClick={() => dispatch({ type: "next" } as ClueMiniAction)}>
            {state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
