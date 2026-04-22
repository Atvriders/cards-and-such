import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LetterBoxedState, LetterBoxedAction, LetterBoxedSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { getSide } from "./puzzles.js";
import "./LetterBoxed.css";

function BoxLetter({
  letter,
  used,
  onClick,
}: {
  letter: string;
  used: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <div
      className={`lb-letter${used ? " used" : ""}`}
      onClick={onClick}
      title={letter}
    >
      {letter}
    </div>
  );
}

export function LetterBoxed({ state, dispatch, onGameOver }: GameProps<LetterBoxedState, LetterBoxedSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.won || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Backspace") {
      dispatch({ type: "backspace" } as LetterBoxedAction);
    } else if (e.key === "Enter") {
      dispatch({ type: "submitWord" } as LetterBoxedAction);
    } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      dispatch({ type: "typeChar", char: e.key } as LetterBoxedAction);
    }
  }, [state.won, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { sides, usedLetters, words, currentInput, error, won, score, lastLetter, allLetters } = state;

  const handleLetterClick = (letter: string) => {
    if (!won) dispatch({ type: "typeChar", char: letter } as LetterBoxedAction);
  };

  const coveredCount = allLetters.filter(l => usedLetters.has(l)).length;

  return (
    <div className="lb-wrap">
      <div className="lb-title">Letter Boxed</div>

      <div className="lb-box-container">
        <div className="lb-box-border" />

        {/* Top side */}
        <div className="lb-side top">
          {sides[0]!.split("").map(l => (
            <BoxLetter key={`top-${l}`} letter={l} used={usedLetters.has(l)} onClick={() => handleLetterClick(l)} />
          ))}
        </div>
        {/* Right side */}
        <div className="lb-side right">
          {sides[1]!.split("").map(l => (
            <BoxLetter key={`right-${l}`} letter={l} used={usedLetters.has(l)} onClick={() => handleLetterClick(l)} />
          ))}
        </div>
        {/* Bottom side */}
        <div className="lb-side bottom">
          {sides[2]!.split("").map(l => (
            <BoxLetter key={`bottom-${l}`} letter={l} used={usedLetters.has(l)} onClick={() => handleLetterClick(l)} />
          ))}
        </div>
        {/* Left side */}
        <div className="lb-side left">
          {sides[3]!.split("").map(l => (
            <BoxLetter key={`left-${l}`} letter={l} used={usedLetters.has(l)} onClick={() => handleLetterClick(l)} />
          ))}
        </div>
      </div>

      <div className="lb-current-word">{currentInput || (lastLetter ? `starts with: ${lastLetter}` : "type a word")}</div>

      {lastLetter && (
        <div className="lb-chain-hint">
          Next word must start with: <strong>{lastLetter}</strong>
        </div>
      )}

      <div className="lb-error">{error ?? " "}</div>

      <div className="lb-actions">
        <button
          className="lb-btn submit"
          disabled={currentInput.length < 3 || won}
          onClick={() => dispatch({ type: "submitWord" } as LetterBoxedAction)}
        >
          Submit
        </button>
        <button
          className="lb-btn clear"
          disabled={currentInput.length === 0 || won}
          onClick={() => dispatch({ type: "clearInput" } as LetterBoxedAction)}
        >
          Clear
        </button>
      </div>

      <div className="lb-progress">
        Letters covered: {coveredCount} / {allLetters.length} &mdash; Words used: {words.length}
      </div>

      {words.length > 0 && (
        <div className="lb-words-used">
          {words.map((w, i) => (
            <span key={i} className="lb-word-chip">{w}</span>
          ))}
        </div>
      )}

      <div className="lb-keyboard-hint">Click letters or type on keyboard. Enter to submit.</div>

      {won && (
        <div className="lb-win">
          <h2>Solved in {words.length} {words.length === 1 ? "word" : "words"}!</h2>
          <p>Score: <strong>{score}</strong></p>
        </div>
      )}
    </div>
  );
}
