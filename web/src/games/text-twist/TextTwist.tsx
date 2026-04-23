import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TextTwistState, TextTwistAction, TextTwistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./TextTwist.css";

export function TextTwist({
  state,
  dispatch,
  onGameOver,
}: GameProps<TextTwistState, TextTwistSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "tick" } as TextTwistAction), 1000);
    return () => clearInterval(id);
  }, [state.gameOver, dispatch]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.gameOver) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") dispatch({ type: "submit" } as TextTwistAction);
    else if (e.key === "Backspace") dispatch({ type: "delete" } as TextTwistAction);
    else if (e.key === "Escape") dispatch({ type: "clear" } as TextTwistAction);
    else if (e.key === " ") { e.preventDefault(); dispatch({ type: "twist" } as TextTwistAction); }
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "type", char: e.key } as TextTwistAction);
  }, [state.gameOver, dispatch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { letters, currentInput, foundWords, score, timeLeft, message, targetWord } = state;

  return (
    <div className="tt-wrap">
      <div className="tt-header">
        <span className="tt-score">Score: {score}</span>
        <span className="tt-timer">{timeLeft}s</span>
      </div>

      <div className="tt-target-hint">
        Target: {targetWord.length}-letter word
        {state.solved && <span className="tt-solved"> ({targetWord} ✓)</span>}
      </div>

      <div className="tt-input">{currentInput || <span className="tt-placeholder">Type or click letters…</span>}</div>
      {message && <div className="tt-message">{message}</div>}

      <div className="tt-letters">
        {letters.map((l, i) => (
          <button
            key={i}
            className="tt-letter-btn"
            onClick={() => dispatch({ type: "type", char: l } as TextTwistAction)}
            disabled={state.gameOver}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="tt-controls">
        <button onClick={() => dispatch({ type: "delete" } as TextTwistAction)}>Del</button>
        <button onClick={() => dispatch({ type: "twist" } as TextTwistAction)}>Twist</button>
        <button onClick={() => dispatch({ type: "clear" } as TextTwistAction)}>Clear</button>
        <button className="tt-submit" onClick={() => dispatch({ type: "submit" } as TextTwistAction)}>Enter</button>
      </div>

      <div className="tt-found">
        <div className="tt-found-header">Found ({foundWords.length} / {state.validWords.length}):</div>
        <div className="tt-found-list">
          {foundWords.map(w => (
            <span key={w} className={`tt-found-word${w === targetWord ? " target" : ""}`}>{w}</span>
          ))}
        </div>
      </div>

      {state.gameOver && (
        <div className="tt-overlay">
          <div className="tt-overlay-box">
            <h2>Time&apos;s Up!</h2>
            <div>Target word: {targetWord}</div>
            <div>Words found: {foundWords.length}</div>
            <div>Score: {score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
