import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodeBreakerState, CodeBreakerSettings } from "./state.js";
import { type CodeBreakerAction, COLORS, type CBColor, CODE_LENGTH, MAX_GUESSES, MAX_HINTS, isTerminal } from "./state.js";
import "./Game.css";

export function CodeBreaker({
  state,
  dispatch,
  onGameOver,
}: GameProps<CodeBreakerState, CodeBreakerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isActive = state.winner === null;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "player") {
    statusText = `Cracked it! Guesses: ${state.guesses.length}. Score: ${state.score}`;
    statusClass = "win";
  } else if (state.winner === "house") {
    statusText = `No guesses left! Secret: ${state.secret.join(", ")}`;
    statusClass = "loss";
  } else {
    statusText = `Guess ${state.guesses.length + 1}/${MAX_GUESSES} — ${state.hintsLeft} hint${state.hintsLeft === 1 ? "" : "s"} left`;
  }

  return (
    <div className="cb">
      <div className="cb-title">Code Breaker</div>
      <div className={`cb-status ${statusClass}`}>{statusText}</div>

      {isActive && (
        <div className="cb-hint-bar">
          <span>Hint tokens: {state.hintsLeft}/{MAX_HINTS}</span>
          <button
            className="cb-hint-btn"
            disabled={state.hintsLeft <= 0 || state.revealed.every(Boolean)}
            onClick={() => dispatch({ type: "useHint" } satisfies CodeBreakerAction)}
          >
            Use Hint
          </button>
        </div>
      )}

      <div className="cb-history">
        {state.guesses.map((row, i) => (
          <div className="cb-row" key={i}>
            <div className="cb-row-num">{i + 1}</div>
            <div className="cb-pegs">
              {row.guess.map((color, j) => (
                <div key={j} className={`cb-peg peg-${color}`} />
              ))}
            </div>
            <div className="cb-row-feedback">
              {row.feedback.bulls}🐂 {row.feedback.cows}🐄
            </div>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="cb-input">
          <div className="cb-input-pegs">
            {state.currentGuess.map((color, pos) => {
              const isSelected = state.selectedPos === pos;
              const isRevealed = state.revealed[pos];
              const classes = [
                "cb-input-peg",
                color ? `peg-${color}` : "empty",
                isSelected ? "selected" : "",
                isRevealed ? "revealed" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={pos}
                  className={classes}
                  onClick={() => dispatch({ type: "selectPos", pos } satisfies CodeBreakerAction)}
                  aria-label={`position ${pos + 1}: ${color ?? "empty"}`}
                  data-testid={`cb-pos-${pos}`}
                />
              );
            })}
          </div>
          <div className="cb-color-picker">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`cb-color-btn peg-${color}`}
                onClick={() => {
                  const pos = state.selectedPos ?? 0;
                  dispatch({ type: "setColor", pos, color } satisfies CodeBreakerAction);
                }}
                aria-label={`color ${color}`}
                data-testid={`cb-color-${color}`}
              />
            ))}
          </div>
          <div className="cb-actions">
            <button
              className="cb-btn clear"
              onClick={() => dispatch({ type: "clear" } satisfies CodeBreakerAction)}
            >
              Clear
            </button>
            <button
              className="cb-btn submit"
              onClick={() => dispatch({ type: "submit" } satisfies CodeBreakerAction)}
              disabled={state.currentGuess.some((c) => c === null)}
              data-testid="cb-submit"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {state.winner !== null && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>The secret code was:</div>
          <div className="cb-secret">
            {state.secret.map((color, i) => (
              <div key={i} className={`cb-peg peg-${color}`} style={{ width: 36, height: 36 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
