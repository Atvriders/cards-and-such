import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberGuesserState, NumberGuesserAction, NumberGuesserSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./NumberGuesser.css";

export function NumberGuesser({
  state,
  dispatch,
  onGameOver,
}: GameProps<NumberGuesserState, NumberGuesserSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = state.gameOver;

  return (
    <div className="ng-game">
      <div className="ng-title">Number Guesser</div>
      <div className="ng-info">
        Guess the secret number (1–{state.range})
      </div>
      <div className="ng-attempts">
        Attempts: {state.attempts} / {state.maxAttempts}
      </div>

      {state.hint && !gameOver && (
        <div className={`ng-hint ${state.hint}`}>
          {state.hint === "higher" && "Go Higher ↑"}
          {state.hint === "lower" && "Go Lower ↓"}
        </div>
      )}

      {!gameOver && (
        <div className="ng-input-section">
          <input
            type="number"
            className="ng-input"
            min={1}
            max={state.range}
            value={state.currentGuess}
            onChange={(e) => dispatch({ type: "set-guess", value: parseInt(e.target.value, 10) || 1 })}
          />
          <input
            type="range"
            className="ng-slider"
            min={1}
            max={state.range}
            value={state.currentGuess}
            onChange={(e) => dispatch({ type: "set-guess", value: parseInt(e.target.value, 10) })}
          />
          <button className="ng-submit" onClick={() => dispatch({ type: "submit" })}>
            Guess!
          </button>
        </div>
      )}

      {state.history.length > 0 && (
        <div className="ng-history">
          <div className="ng-history-title">History</div>
          {[...state.history].reverse().map((entry, i) => (
            <div key={i} className="ng-history-entry">
              <span>#{state.history.length - i}: {entry.guess}</span>
              <span className={`hint-${entry.hint}`}>
                {entry.hint === "higher" ? "↑ higher" : entry.hint === "lower" ? "↓ lower" : "✓ correct!"}
              </span>
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="ng-game-over">
          {state.winner === "player" ? (
            <>
              Correct! The number was {state.secret}.
              <br />
              <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Solved in {state.attempts} attempt{state.attempts !== 1 ? "s" : ""} — Score: {terminal?.score}
              </span>
            </>
          ) : (
            <>
              Out of guesses! The number was {state.secret}.
            </>
          )}
        </div>
      )}
    </div>
  );
}
