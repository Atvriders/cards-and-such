import { useEffect, useCallback, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordScrambleState, WordScrambleAction, WordScrambleSettings } from "./state.js";
import { isTerminal, reducer } from "./state.js";
import "./WordScramble.css";

export function WordScramble({
  state,
  dispatch,
  onGameOver,
  seed,
}: GameProps<WordScrambleState, WordScrambleSettings> & { seed?: number }): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleSubmit = useCallback(() => {
    (dispatch as (a: WordScrambleAction, s?: number) => void)({ type: "submit" }, seed ?? 0);
  }, [dispatch, seed]);

  const handleHint = useCallback(() => {
    (dispatch as (a: WordScrambleAction, s?: number) => void)({ type: "hint" }, seed ?? 0);
  }, [dispatch, seed]);

  const handleSkip = useCallback(() => {
    (dispatch as (a: WordScrambleAction, s?: number) => void)({ type: "skip" }, seed ?? 0);
  }, [dispatch, seed]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { handleSubmit(); return; }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    // Sync input by firing type actions for each new char
    const diff = val.length - state.input.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        dispatch({ type: "type", char: val[state.input.length + i] ?? "" } as WordScrambleAction);
      }
    } else if (diff < 0) {
      for (let i = 0; i < -diff; i++) {
        dispatch({ type: "backspace" } as WordScrambleAction);
      }
    }
  }, [dispatch, state.input]);

  const { scrambled, input, score, questionIndex, totalQuestions, hintsUsed, targetWord } = state;

  return (
    <div className="ws-wrap">
      <div className="ws-progress">Question {questionIndex + 1} / {totalQuestions} &mdash; Score: {score}</div>

      <div className="ws-scrambled">{scrambled}</div>

      <div className="ws-hint-text">
        {hintsUsed > 0 ? `Hint: starts with "${targetWord.slice(0, state.hintsRevealed)}"` : ""}
      </div>

      <div className="ws-input-row">
        <input
          ref={inputRef}
          className="ws-input"
          type="text"
          value={input}
          maxLength={targetWord.length}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="ws-buttons">
        <button
          className="ws-btn ws-btn-submit"
          onClick={handleSubmit}
          disabled={input.length === 0}
        >
          Submit
        </button>
        <button className="ws-btn ws-btn-hint" onClick={handleHint}>
          Hint
        </button>
        <button className="ws-btn ws-btn-skip" onClick={handleSkip}>
          Skip
        </button>
      </div>

      <div className="ws-score">Score: {score}</div>

      {terminal && (
        <div className="ws-overlay">
          <div className="ws-overlay-box">
            <h2>All done!</h2>
            <div className="ws-final-score">Final Score: {terminal.score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
