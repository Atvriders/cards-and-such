import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FractionMatcherState } from "./state.js";
import { isTerminal } from "./state.js";
import type { fractionMatcherSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type FractionMatcherSettingsType = SettingsOf<typeof fractionMatcherSettings>;

const LABELS = ["A", "B", "C", "D"];

export function FractionMatcherGame({ state, dispatch, onGameOver }: GameProps<FractionMatcherState, FractionMatcherSettingsType>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (terminal) {
    return (
      <div className="fm-wrap">
        <div className="fm-done">
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
  const label = q.type === "decimal" ? "Pick the decimal equivalent:" : "Pick an equivalent fraction:";

  return (
    <div className="fm-wrap">
      <div className="fm-header">
        <span>Q <strong>{state.currentIndex + 1}</strong>/{total}</span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>Correct: <strong>{state.correctCount}</strong></span>
      </div>

      <div className="fm-progress-bar">
        <div className="fm-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="fm-fraction">
        <span>{q.numerator}</span>
        <div className="fm-fraction-bar" />
        <span>{q.denominator}</span>
      </div>

      <p className="fm-question">{label}</p>

      <div className="fm-choices">
        {q.choices.map((choice, i) => {
          let cls = "fm-choice";
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
              <span style={{ marginRight: 8, color: "#999" }}>{LABELS[i]}.</span>{choice}
            </button>
          );
        })}
      </div>

      {isResult && (
        <div className={`fm-feedback ${state.selected === q.correctIndex ? "correct" : "wrong"}`}>
          {state.selected === q.correctIndex ? "Correct! +10" : `Wrong! Answer: ${q.choices[q.correctIndex]}`}
        </div>
      )}

      <div className="fm-actions">
        {!isResult && (
          <button className="fm-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" })}>
            Submit
          </button>
        )}
        {isResult && (
          <button className="fm-btn next" onClick={() => dispatch({ type: "next" })}>
            {state.currentIndex + 1 >= total ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
