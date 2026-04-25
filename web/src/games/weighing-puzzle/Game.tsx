import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WeighingState, WeighingSettings } from "./state.js";
import { type WeighingAction, isTerminal } from "./state.js";
import "./Game.css";

const SCALE_SYMBOL = { left: "⬆ LEFT", right: "⬆ RIGHT", equal: "= EQUAL" } as const;
const SCALE_CSS = { left: "scale-left", right: "scale-right", equal: "scale-equal" } as const;

export function WeighingPuzzleGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<WeighingState, WeighingSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, guessedBall, guessedHeavier, submitted, correct } = state;

  return (
    <div className="weighing">
      <div className="weighing-title">{puzzle.title}</div>
      <div className="weighing-desc">{puzzle.description}</div>

      <div className="weighing-weighings">
        <div className="weighing-sec-title">Scale Results:</div>
        {puzzle.weighings.map((w, i) => (
          <div className="weighing-row" key={i}>
            <span className="weighing-num">Weighing {i + 1}:</span>
            <span className="weighing-left">Left [{w.left.join(",")}]</span>
            <span className={`weighing-result ${SCALE_CSS[w.result]}`}>
              {SCALE_SYMBOL[w.result]}
            </span>
            <span className="weighing-right">Right [{w.right.join(",")}]</span>
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="weighing-answer">
          <div className="weighing-sec-title">Your Answer:</div>
          <div className="weighing-balls">
            {Array.from({ length: puzzle.numBalls }, (_, i) => i + 1).map((b) => (
              <button
                key={b}
                className={`weighing-ball-btn ${guessedBall === b ? "selected" : ""}`}
                onClick={() => dispatch({ type: "selectBall", ball: b } satisfies WeighingAction)}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="weighing-weight">
            <button
              className={`weighing-weight-btn ${guessedHeavier ? "selected" : ""}`}
              onClick={() => dispatch({ type: "selectWeight", heavier: true } satisfies WeighingAction)}
            >
              Heavier
            </button>
            <button
              className={`weighing-weight-btn ${!guessedHeavier ? "selected" : ""}`}
              onClick={() => dispatch({ type: "selectWeight", heavier: false } satisfies WeighingAction)}
            >
              Lighter
            </button>
          </div>
          <button
            className="weighing-submit-btn"
            disabled={guessedBall === 0}
            onClick={() => dispatch({ type: "submit" } satisfies WeighingAction)}
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className={`weighing-result-box ${correct ? "result-correct" : "result-wrong"}`}>
          {correct
            ? `Correct! Ball ${puzzle.answer.ball} is ${puzzle.answer.heavier ? "heavier" : "lighter"}.`
            : `Wrong! The odd ball was #${puzzle.answer.ball} (${puzzle.answer.heavier ? "heavier" : "lighter"}).`}
          <button
            className="weighing-next-btn"
            onClick={() => dispatch({ type: "reset" } satisfies WeighingAction)}
          >
            Next Puzzle
          </button>
        </div>
      )}
    </div>
  );
}
