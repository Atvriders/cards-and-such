import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HangmanState, HangmanAction, HangmanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Hangman.css";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** SVG hangman figure — reveals parts progressively */
function HangmanFigure({ wrong, max }: { wrong: number; max: number }): JSX.Element {
  // Normalize to 6 stages regardless of maxWrong
  const stage = Math.round((wrong / max) * 6);
  return (
    <svg className="hgm-figure" viewBox="0 0 120 140" aria-label={`Hangman: ${wrong} wrong guesses`}>
      {/* Gallows */}
      <line x1="10" y1="130" x2="110" y2="130" stroke="#333" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="130" x2="30" y2="10"  stroke="#333" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="10"  x2="75" y2="10"  stroke="#333" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="10"  x2="75" y2="28"  stroke="#333" strokeWidth="3" strokeLinecap="round" />
      {/* Head */}
      {stage >= 1 && <circle cx="75" cy="38" r="10" stroke="#333" strokeWidth="3" fill="none" />}
      {/* Body */}
      {stage >= 2 && <line x1="75" y1="48" x2="75" y2="88" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
      {/* Left arm */}
      {stage >= 3 && <line x1="75" y1="58" x2="58" y2="74" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
      {/* Right arm */}
      {stage >= 4 && <line x1="75" y1="58" x2="92" y2="74" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
      {/* Left leg */}
      {stage >= 5 && <line x1="75" y1="88" x2="60" y2="108" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
      {/* Right leg */}
      {stage >= 6 && <line x1="75" y1="88" x2="90" y2="108" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}

export function Hangman({
  state,
  dispatch,
  onGameOver,
}: GameProps<HangmanState, HangmanSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const handleGuess = useCallback((letter: string) => {
    dispatch({ type: "guess", letter } as HangmanAction);
  }, [dispatch]);

  // Physical keyboard support
  useEffect(() => {
    if (terminal) return;
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        handleGuess(key);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [terminal, handleGuess]);

  const { target, guessed, wrongGuesses, maxWrongNum, won, lost } = state;

  const guessedSet = new Set(guessed);

  return (
    <div className="hgm-wrap">
      <HangmanFigure wrong={wrongGuesses} max={maxWrongNum} />

      <div className="hgm-status">
        Wrong: {wrongGuesses} / {maxWrongNum}
      </div>

      <div className="hgm-word">
        {target.split("").map((ch, i) => (
          <div key={i} className="hgm-letter-slot">
            <span className="hgm-letter-char">
              {guessedSet.has(ch) ? ch : "\u00A0"}
            </span>
            <div className="hgm-letter-line" />
          </div>
        ))}
      </div>

      <div className="hgm-keyboard">
        {ALPHABET.map(letter => {
          const wasGuessed = guessedSet.has(letter);
          const isCorrect = wasGuessed && target.includes(letter);
          const isWrong = wasGuessed && !target.includes(letter);
          return (
            <button
              key={letter}
              className={`hgm-key${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
              disabled={wasGuessed || won || lost}
              onClick={() => handleGuess(letter)}
              aria-label={`Guess ${letter}`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {(won || lost) && (
        <div className="hgm-overlay">
          <div className="hgm-overlay-box">
            <h2>{won ? "You win!" : "Game over!"}</h2>
            <div className="hgm-target-reveal">{target}</div>
            {won && (
              <div className="hgm-score">
                Score: {(maxWrongNum - wrongGuesses) * 50 + target.length * 10}
              </div>
            )}
            {lost && (
              <div className="hgm-score">Better luck next time!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
