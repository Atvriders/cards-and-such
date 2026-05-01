import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcrosticState, AcrosticAction, AcrosticSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Acrostic.css";

export function Acrostic({
  state,
  dispatch,
  onGameOver,
}: GameProps<AcrosticState, AcrosticSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Backspace") dispatch({ type: "delete" } as AcrosticAction);
    else if (e.key === "Escape") dispatch({ type: "clear" } as AcrosticAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as AcrosticAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { puzzle, clueInputs, selectedClue, currentInput, checked, score } = state;

  // Build visible inputs (what's shown per clue)
  function getDisplayInput(i: number): string {
    if (i === selectedClue) return currentInput;
    return clueInputs[i] ?? "";
  }

  return (
    <div className="acr-wrap">
      <div className="acr-quote">
        <div className="acr-quote-label">Quote:</div>
        <div className="acr-quote-text">&ldquo;{puzzle.quote}&rdquo;</div>
        <div className="acr-quote-author">— <em>{puzzle.author.split("").join(" ")}</em></div>
      </div>

      <div className="acr-clues-section">
        {puzzle.clues.map((c, i) => {
          const val = getDisplayInput(i);
          const isSelected = selectedClue === i;
          const isCorrect = checked && val.toUpperCase() === c.answer.toUpperCase();
          const isWrong = checked && val && !isCorrect;
          return (
            <div
              key={i}
              className={`acr-clue-row${isSelected ? " acr-selected" : ""}${isCorrect ? " acr-correct" : ""}${isWrong ? " acr-wrong" : ""}`}
              onClick={() => dispatch({ type: "selectClue", index: i } as AcrosticAction)}
            >
              <div className="acr-clue-letter">{c.letter}.</div>
              <div className="acr-clue-body">
                <div className="acr-clue-text">{c.clue}</div>
                <div className="acr-clue-input">{val || " "}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="acr-controls">
        <button onClick={() => dispatch({ type: "delete" } as AcrosticAction)}>Delete</button>
        <button onClick={() => dispatch({ type: "clear" } as AcrosticAction)}>Clear</button>
        {!state.gameOver && (
          <button className="acr-check-btn" onClick={() => dispatch({ type: "check" } as AcrosticAction)}>Check Answers</button>
        )}
      </div>

      {state.message && <div className="acr-message">{state.message}</div>}
      {checked && <div className="acr-score">Score: {score} / 100</div>}

      {state.gameOver && (
        <div className="acr-overlay">
          <div className="acr-overlay-box">
            <h2>Results</h2>
            <div>Author: {puzzle.author}</div>
            <div>Score: {score} / 100</div>
          </div>
        </div>
      )}
    </div>
  );
}
