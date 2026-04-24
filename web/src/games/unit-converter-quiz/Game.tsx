import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnitConverterState } from "./state.js";
import { isTerminal } from "./state.js";
import type { unitConverterSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type UnitConverterSettingsType = SettingsOf<typeof unitConverterSettings>;

const LABELS = ["A", "B", "C", "D"];

export function UnitConverterQuizGame({ state, dispatch, onGameOver }: GameProps<UnitConverterState, UnitConverterSettingsType>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (terminal) {
    return (
      <div className="uc-wrap">
        <div className="uc-done">
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
    <div className="uc-wrap">
      <div className="uc-header">
        <span>Q <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span className="uc-category-badge">{q.category}</span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="uc-progress-bar">
        <div className="uc-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="uc-question">{q.question}</div>

      <div className="uc-choices">
        {q.choices.map((choice, i) => {
          let cls = "uc-choice";
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
              onClick={() => dispatch({ type: "select", index: i })}
            >
              <span className="uc-choice-letter">{LABELS[i]}</span>
              {choice}
            </button>
          );
        })}
      </div>

      {isResult && (
        <div className={`uc-feedback ${state.selected === q.correctIndex ? "correct" : "wrong"}`}>
          {state.selected === q.correctIndex ? "Correct! +10" : `Wrong! Answer: ${q.choices[q.correctIndex]}`}
        </div>
      )}

      <div className="uc-actions">
        {!isResult && (
          <button className="uc-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" })}>
            Submit
          </button>
        )}
        {isResult && (
          <button className="uc-btn next" onClick={() => dispatch({ type: "next" })}>
            {state.currentIndex + 1 >= total ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
