import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RiddleState, RiddleSettings } from "./state.js";
import { type RiddleAction, RIDDLES, isTerminal } from "./state.js";
import "./Game.css";

const CATEGORY_LABELS: Record<string, string> = {
  classic: "Classic Riddle",
  math: "Math Puzzle",
  wordplay: "Wordplay",
  lateral: "Lateral Thinking",
};

export function RiddleMachineGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<RiddleState, RiddleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { queue, currentIndex, selectedOption, submitted, correct, totalScore, streak, answered } = state;
  const riddle = RIDDLES[queue[currentIndex]!]!;

  return (
    <div className="riddle-machine">
      <div className="rm-header">
        <div className="rm-title">Riddle Machine</div>
        <div className="rm-score">Score: {totalScore}{streak > 1 ? ` 🔥×${streak}` : ""}</div>
      </div>

      <div className="rm-meta">
        <span className="rm-category">{CATEGORY_LABELS[riddle.category]}</span>
        <span className="rm-count">#{answered + 1}</span>
      </div>

      <div className="rm-question">{riddle.question}</div>

      <div className="rm-options">
        {riddle.options.map((opt, i) => {
          let cls = "rm-option";
          if (submitted) {
            if (i === riddle.correctIndex) cls += " correct";
            else if (i === selectedOption && !correct) cls += " wrong";
          } else if (i === selectedOption) {
            cls += " selected";
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => {
                if (!submitted) dispatch({ type: "selectOption", option: i } satisfies RiddleAction);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          className="rm-submit-btn"
          disabled={selectedOption === null}
          onClick={() => dispatch({ type: "submit" } satisfies RiddleAction)}
        >
          Submit Answer
        </button>
      ) : (
        <div className={`rm-result ${correct ? "rm-correct" : "rm-wrong"}`}>
          <div className="rm-verdict">{correct ? `Correct! +${state.roundScore}` : "Wrong!"}</div>
          <div className="rm-explanation">{riddle.explanation}</div>
          <button
            className="rm-next-btn"
            onClick={() => dispatch({ type: "next" } satisfies RiddleAction)}
          >
            Next Riddle
          </button>
        </div>
      )}
    </div>
  );
}
