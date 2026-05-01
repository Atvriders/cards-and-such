import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AnagramState, AnagramSettings, AnagramAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Anagram.css";

export function Anagram({
  state,
  dispatch,
  onGameOver,
}: GameProps<AnagramState, AnagramSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (terminal) return;
      if (e.key === "Enter") dispatch({ type: "submit" } as AnagramAction);
      else if (e.key === "Backspace") dispatch({ type: "backspace" } as AnagramAction);
      else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "letter", char: e.key } as AnagramAction);
    },
    [dispatch, terminal],
  );

  const guessesLeft = state.maxGuesses - state.guesses.length;

  return (
    <div className="anagram" tabIndex={0} onKeyDown={handleKey} style={{ outline: "none" }}>
      <div className="ang-scrambled-label">Unscramble this word</div>
      <div className="ang-scrambled">{state.scrambled}</div>

      <div className="ang-info">
        Guesses left: {guessesLeft} · Word length: {state.wordLength}
      </div>

      <div className="ang-guesses">
        {state.guesses.map((guess, i) => {
          const isCorrect = guess === state.target;
          return (
            <div key={`${guess}-${i}`} className="ang-guess-row">
              {guess.split("").map((ch, j) => (
                <div key={j} className={`ang-guess-tile ${isCorrect ? "correct" : "wrong"}`}>
                  {ch}
                </div>
              ))}
              {isCorrect && <span style={{ marginLeft: 8, color: "#15803d", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
      </div>

      {!state.won && !state.lost && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div className="ang-input-row">
            {Array.from({ length: state.wordLength }, (_, i) => {
              const ch = state.currentGuess[i] ?? "";
              const isActive = i === state.currentGuess.length;
              return (
                <div key={i} className={`ang-tile${isActive ? " active" : ""}`}>
                  {ch}
                </div>
              );
            })}
          </div>
          <button
            className="ang-submit-btn"
            onClick={() => dispatch({ type: "submit" } as AnagramAction)}
            disabled={state.currentGuess.length !== state.wordLength}
          >
            Check
          </button>
          <p className="ang-hint">
            Click the puzzle, then type your guess and press Enter
          </p>
        </div>
      )}

      {(state.won || state.lost) && (
        <div className={`ang-status ${state.won ? "won" : "lost"}`}>
          {state.won
            ? `Correct! The word was ${state.target}.`
            : `Out of guesses! The word was ${state.target}.`}
        </div>
      )}
    </div>
  );
}
