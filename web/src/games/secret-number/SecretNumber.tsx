import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SecretNumberState, SecretNumberSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./SecretNumber.css";

export function SecretNumber({
  state,
  dispatch,
  onGameOver,
}: GameProps<SecretNumberState, SecretNumberSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  let statusText = `Guess a number between 1 and ${state.range}`;
  let statusClass = "";
  if (state.gameOver) {
    if (state.winner) {
      statusText = `Correct! The number was ${state.secret}.`;
      statusClass = "win";
    } else {
      statusText = `Out of guesses! The number was ${state.secret}.`;
      statusClass = "loss";
    }
  }

  const hintLabel: Record<string, string> = {
    higher: "↑ Higher",
    lower: "↓ Lower",
    correct: "✓ Correct!",
  };

  return (
    <div className="sn">
      <div className="sn-info">
        <span>Range: 1–{state.range}</span>
        <span>Attempts: {state.attempts}/{state.maxAttempts}</span>
        <span>Lies budget: {state.maxLies}</span>
      </div>

      {state.lastHint && !state.gameOver && (
        <div className={`sn-hint-bar ${state.lastHint}`}>
          {hintLabel[state.lastHint]}
        </div>
      )}

      <div className={`sn-status ${statusClass}`}>{statusText}</div>

      {!state.gameOver && (
        <div className="sn-input-row">
          <input
            className="sn-input"
            type="number"
            min={1}
            max={state.range}
            value={state.currentGuess}
            onChange={(e) => dispatch({ type: "set-guess", value: parseInt(e.target.value || "1", 10) })}
          />
          <button className="sn-submit" onClick={() => dispatch({ type: "submit" })}>
            Guess
          </button>
        </div>
      )}

      {state.maxLies > 0 && !state.gameOver && (
        <div className="sn-reveal">
          Warning: the bot may lie up to {state.maxLies} time{state.maxLies > 1 ? "s" : ""}.
          Lies used: {state.liesUsed}
        </div>
      )}

      {state.history.length > 0 && (
        <div className="sn-history">
          {[...state.history].reverse().map((r, i) => (
            <div key={i} className={`sn-history-row ${r.hint}`}>
              <span>#{state.history.length - i}: {r.guess}</span>
              <span>{hintLabel[r.hint]}{r.wasLie && state.gameOver ? " (LIE)" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {state.gameOver && (
        <button className="sn-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
