import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DigitState, DigitSettings } from "./state.js";
import { type DigitAction, isTerminal } from "./state.js";
import "./Game.css";

export function DigitDeduceGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DigitState, DigitSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, entries, submitted, correct } = state;
  const allFilled = entries.every((e) => e !== null);

  return (
    <div className="digit-deduce">
      <div className="dd-title">{puzzle.title}</div>
      {submitted && (
        <div className={`dd-verdict ${correct ? "dd-win" : "dd-lose"}`}>
          {correct ? `Solved! Score: ${terminal?.score}` : `Wrong! Answer: ${puzzle.solution.join(" ")}`}
        </div>
      )}

      <div className="dd-clues">
        <div className="dd-clues-title">Clues</div>
        <ul className="dd-clue-list">
          {puzzle.clues.map((c, i) => <li key={i}>{c.description}</li>)}
        </ul>
      </div>

      <div className="dd-entries">
        {Array.from({ length: puzzle.length }, (_, i) => (
          <div className="dd-entry-col" key={i}>
            <div className="dd-entry-label">#{i + 1}</div>
            <div className="dd-entry-cell">
              <button
                className="dd-inc"
                onClick={() => {
                  const cur = entries[i] ?? -1;
                  dispatch({ type: "setDigit", pos: i, digit: (cur + 1) % 10 } satisfies DigitAction);
                }}
              >▲</button>
              <div className={`dd-digit ${entries[i] === null ? "blank" : ""} ${submitted && entries[i] === puzzle.solution[i] ? "correct" : submitted ? "wrong" : ""}`}>
                {entries[i] === null ? "?" : entries[i]}
              </div>
              <button
                className="dd-dec"
                onClick={() => {
                  const cur = entries[i] ?? 1;
                  dispatch({ type: "setDigit", pos: i, digit: (cur - 1 + 10) % 10 } satisfies DigitAction);
                }}
              >▼</button>
            </div>
          </div>
        ))}
      </div>

      <div className="dd-actions">
        {!submitted ? (
          <button
            className="dd-btn submit"
            disabled={!allFilled}
            onClick={() => dispatch({ type: "submit" } satisfies DigitAction)}
          >
            Check Answer
          </button>
        ) : (
          <button
            className="dd-btn reset"
            onClick={() => dispatch({ type: "reset" } satisfies DigitAction)}
          >
            Next Puzzle
          </button>
        )}
        <button
          className="dd-btn clear"
          onClick={() => {
            for (let i = 0; i < puzzle.length; i++) {
              dispatch({ type: "setDigit", pos: i, digit: null } satisfies DigitAction);
            }
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
