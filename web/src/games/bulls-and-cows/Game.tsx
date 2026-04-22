import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BullsAndCowsState, BullsAndCowsSettings } from "./state.js";
import { type BullsAndCowsAction, MAX_GUESSES, isTerminal } from "./state.js";
import "./Game.css";

export function BullsAndCows({
  state,
  dispatch,
  onGameOver,
}: GameProps<BullsAndCowsState, BullsAndCowsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isActive = state.winner === null;
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "player") {
    statusText = `Cracked it in ${state.guesses.length} guess${state.guesses.length === 1 ? "" : "es"}! Score: ${state.score}`;
    statusClass = "win";
  } else if (state.winner === "house") {
    statusText = `Out of guesses! Secret: ${state.secret.join("")}`;
    statusClass = "loss";
  } else {
    statusText = `Guess ${state.guesses.length + 1} of ${MAX_GUESSES} — ${guessesLeft} left`;
  }

  function handleDigit(d: string) {
    dispatch({ type: "typeDigit", digit: d } satisfies BullsAndCowsAction);
  }

  return (
    <div className="bac">
      <div className="bac-title">Bulls &amp; Cows</div>
      <div className={`bac-status ${statusClass}`}>{statusText}</div>

      <div className="bac-history">
        {state.guesses.map((row, i) => (
          <div className="bac-row" key={i}>
            <div className="bac-row-num">{i + 1}</div>
            <div className="bac-row-guess">{row.guess.join("")}</div>
            <div className="bac-row-feedback">
              {row.bulls}🐂 {row.cows}🐄
            </div>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="bac-input">
          <div className="bac-display">{state.currentGuess || "\u00a0"}</div>
          <div className="bac-numpad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
              <button key={d} className="bac-btn" onClick={() => handleDigit(d)} data-testid={`digit-${d}`}>
                {d}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="bac-btn back"
              onClick={() => dispatch({ type: "backspace" } satisfies BullsAndCowsAction)}
            >
              ←
            </button>
            <button
              className="bac-btn submit"
              onClick={() => dispatch({ type: "submit" } satisfies BullsAndCowsAction)}
              disabled={state.currentGuess.length !== state.codeLength}
              data-testid="submit-guess"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {state.winner !== null && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>The secret was:</div>
          <div className="bac-secret">{state.secret.join("")}</div>
        </div>
      )}
    </div>
  );
}
