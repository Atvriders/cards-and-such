import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SafeCrackerState, SafeCrackerSettings } from "./state.js";
import { type SafeCrackerAction, CODE_DIGITS, DIGIT_MAX, MAX_ATTEMPTS, isTerminal } from "./state.js";
import "./Game.css";

export function SafeCrackerGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SafeCrackerState, SafeCrackerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { attempts, currentGuess, phase, secret } = state;
  const isPlaying = phase === "playing";

  return (
    <div className="safe-cracker">
      <div className="sc-header">
        <div className="sc-title">Safe Cracker</div>
        <div className="sc-safe-icon">🔐</div>
      </div>

      <div className="sc-subtitle">
        {isPlaying
          ? `Crack the ${CODE_DIGITS}-digit code! Attempt ${attempts.length + 1} of ${MAX_ATTEMPTS}`
          : phase === "won"
          ? `Cracked! Score: ${state.score}`
          : `Failed! Code was: ${secret.join("")}`}
      </div>

      <div className="sc-history">
        {attempts.map((a, i) => (
          <div className="sc-row" key={i}>
            <div className="sc-row-num">{i + 1}</div>
            <div className="sc-digits">
              {a.guess.map((d, j) => <span className="sc-digit" key={j}>{d}</span>)}
            </div>
            <div className="sc-hints">
              <span className="sc-exact" title="Exact">{a.exact}✓</span>
              <span className="sc-misplaced" title="Misplaced">{a.misplaced}~</span>
            </div>
          </div>
        ))}
      </div>

      {isPlaying && (
        <div className="sc-input">
          <div className="sc-input-label">Your guess:</div>
          <div className="sc-input-digits">
            {currentGuess.map((d, pos) => (
              <div className="sc-digit-col" key={pos}>
                <button
                  className="sc-up-btn"
                  onClick={() => dispatch({ type: "setDigit", pos, digit: (d + 1) % (DIGIT_MAX + 1) } satisfies SafeCrackerAction)}
                  aria-label="increase"
                >
                  ▲
                </button>
                <div className="sc-input-digit">{d}</div>
                <button
                  className="sc-down-btn"
                  onClick={() => dispatch({ type: "setDigit", pos, digit: (d - 1 + DIGIT_MAX + 1) % (DIGIT_MAX + 1) } satisfies SafeCrackerAction)}
                  aria-label="decrease"
                >
                  ▼
                </button>
              </div>
            ))}
          </div>
          <div className="sc-actions">
            <button className="sc-btn clear" onClick={() => dispatch({ type: "clear" } satisfies SafeCrackerAction)}>
              Clear
            </button>
            <button className="sc-btn submit" onClick={() => dispatch({ type: "submit" } satisfies SafeCrackerAction)}>
              Try Code
            </button>
          </div>
        </div>
      )}

      <div className="sc-legend">
        <span className="sc-exact">✓ = correct digit &amp; position</span>
        <span className="sc-misplaced">~ = correct digit, wrong position</span>
      </div>
    </div>
  );
}
