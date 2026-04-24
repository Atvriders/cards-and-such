import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MissingLettersState, MissingLettersAction, MissingLettersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MissingLetters.css";

export function MissingLetters({
  state,
  dispatch,
  onGameOver,
  seed,
}: GameProps<MissingLettersState, MissingLettersSettings> & { seed?: number }): JSX.Element {
  const terminal = isTerminal(state);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Focus the current slot
  useEffect(() => {
    if (!state.submitted) {
      inputRefs.current[state.focusedSlot]?.focus();
    }
  }, [state.focusedSlot, state.submitted, state.questionIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, slotIndex: number) => {
    if (e.key === "Backspace") {
      dispatch({ type: "backspace" } as MissingLettersAction);
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      dispatch({ type: "submit" } as MissingLettersAction);
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      dispatch({ type: "type", char: e.key } as MissingLettersAction);
      e.preventDefault();
    }
  }, [dispatch]);

  const { word, hiddenIndices, input, focusedSlot, submitted, correct, score, questionIndex, totalQuestions } = state;

  let slotIndex = 0;

  const letters = word.split("").map((ch, i) => {
    const isHidden = hiddenIndices.includes(i);
    if (isHidden) {
      const sIdx = slotIndex++;
      const filled = input[sIdx] ?? "";
      const isCorrectCell = submitted && filled === ch;
      const isWrongCell = submitted && filled !== ch;
      return (
        <div key={i} className="ml-blank">
          <input
            ref={el => { inputRefs.current[sIdx] = el; }}
            className={`ml-blank-input${sIdx === focusedSlot && !submitted ? " focused" : ""}${isCorrectCell ? " correct-cell" : ""}${isWrongCell ? " wrong-cell" : ""}`}
            type="text"
            maxLength={1}
            value={filled}
            readOnly
            onFocus={() => dispatch({ type: "focusSlot", slotIndex: sIdx } as MissingLettersAction)}
            onKeyDown={e => handleKeyDown(e, sIdx)}
            onClick={() => dispatch({ type: "focusSlot", slotIndex: sIdx } as MissingLettersAction)}
            tabIndex={0}
          />
          <div className="ml-blank-line" />
        </div>
      );
    }
    return (
      <div key={i} className="ml-letter">
        <span className="ml-letter-char">{ch}</span>
        <div className="ml-letter-line" />
      </div>
    );
  });

  return (
    <div className="ml-wrap">
      <div className="ml-progress">
        Word {questionIndex + 1} / {totalQuestions} &mdash; Score: {score}
      </div>

      <div className="ml-word">{letters}</div>

      <div className={`ml-feedback${submitted ? (correct ? " correct" : " wrong") : ""}`}>
        {submitted ? (correct ? "Correct! +10" : `Wrong! The word was ${word}`) : "Fill in the missing letters"}
      </div>

      <div className="ml-buttons">
        {!submitted && (
          <button
            className="ml-btn ml-btn-submit"
            disabled={input.some(ch => ch === "")}
            onClick={() => dispatch({ type: "submit" } as MissingLettersAction)}
          >
            Submit
          </button>
        )}
        {submitted && !terminal && (
          <button
            className="ml-btn ml-btn-next"
            onClick={() => dispatch({ type: "next", seed: seed ?? 0 } as MissingLettersAction)}
          >
            Next
          </button>
        )}
      </div>

      {terminal && (
        <div className="ml-overlay">
          <div className="ml-overlay-box">
            <h2>All Done!</h2>
            <div className="ml-final-score">Score: {terminal.score} / {totalQuestions * 10}</div>
          </div>
        </div>
      )}
    </div>
  );
}
