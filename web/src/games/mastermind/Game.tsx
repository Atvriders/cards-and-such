import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MastermindState, MastermindSettings } from "./state.js";
import { type MastermindAction, COLORS, type Color, CODE_LENGTH, MAX_GUESSES, isTerminal } from "./state.js";
import "./Game.css";

const COLOR_CSS: Record<Color, string> = {
  red: "peg-red",
  orange: "peg-orange",
  yellow: "peg-yellow",
  green: "peg-green",
  blue: "peg-blue",
  purple: "peg-purple",
};

export function Mastermind({
  state,
  dispatch,
  onGameOver,
}: GameProps<MastermindState, MastermindSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isActive = state.winner === null;
  const guessesLeft = MAX_GUESSES - state.guesses.length;

  function handlePegClick(pos: number) {
    if (!isActive) return;
    setSelectedPos(pos === selectedPos ? null : pos);
  }

  function handleColorPick(color: Color) {
    if (!isActive || selectedPos === null) return;
    dispatch({ type: "setColor", pos: selectedPos, color } satisfies MastermindAction);
    // Advance to next position
    setSelectedPos(selectedPos < CODE_LENGTH - 1 ? selectedPos + 1 : null);
  }

  function handleSubmit() {
    if (!isActive) return;
    dispatch({ type: "submit" } satisfies MastermindAction);
    setSelectedPos(null);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "player") {
    statusText = `You cracked it in ${state.guesses.length} guess${state.guesses.length === 1 ? "" : "es"}! Score: ${state.score}`;
    statusClass = "win";
  } else if (state.winner === "codemaker") {
    statusText = `Out of guesses! The code was: ${state.secret.join(", ")}`;
    statusClass = "loss";
  } else {
    statusText = `Guess ${state.guesses.length + 1} of ${MAX_GUESSES} — ${guessesLeft} guesses left`;
  }

  return (
    <div className="mastermind">
      <div className="mastermind-title">Crack the 4-color code!</div>
      <div className={`mastermind-status ${statusClass}`}>{statusText}</div>

      <div className="mastermind-history">
        {state.guesses.map((row, i) => {
          const { blacks, whites } = row.feedback;
          const fbPegs = [
            ...new Array(blacks).fill("black"),
            ...new Array(whites).fill("white"),
            ...new Array(CODE_LENGTH - blacks - whites).fill("empty"),
          ];
          return (
            <div className="mastermind-row" key={i}>
              <div className="mastermind-row-number">{i + 1}</div>
              <div className="mastermind-pegs">
                {row.guess.map((color, j) => (
                  <div key={j} className={`mastermind-peg peg-${color}`} />
                ))}
              </div>
              <div className="mastermind-feedback">
                {fbPegs.map((type, j) => (
                  <div key={j} className={`mastermind-fb-peg ${type}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isActive && (
        <div className="mastermind-input">
          <div className="mastermind-input-label">
            {selectedPos === null ? "Click a peg to select it, then pick a color" : `Peg ${selectedPos + 1} selected — pick a color`}
          </div>
          <div className="mastermind-input-pegs">
            {state.currentGuess.map((color, pos) => (
              <button
                key={pos}
                className={`mastermind-input-peg peg-${color} ${selectedPos === pos ? "selected" : ""}`}
                onClick={() => handlePegClick(pos)}
                aria-label={`peg ${pos + 1}: ${color}`}
                data-testid={`guess-peg-${pos}`}
                style={selectedPos === pos ? { boxShadow: "0 0 0 4px #2060c0" } : {}}
              />
            ))}
          </div>
          <div className="mastermind-color-picker">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`mastermind-color-btn peg-${color}`}
                onClick={() => handleColorPick(color)}
                aria-label={`color ${color}`}
                data-testid={`color-${color}`}
              />
            ))}
          </div>
          <div className="mastermind-actions">
            <button className="mastermind-btn clear" onClick={() => dispatch({ type: "clear" })}>
              Clear
            </button>
            <button className="mastermind-btn submit" onClick={handleSubmit} data-testid="submit-guess">
              Submit Guess
            </button>
          </div>
        </div>
      )}

      {state.winner !== null && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>The secret code was:</div>
          <div className="mastermind-secret">
            {state.secret.map((color, i) => (
              <div key={i} className={`mastermind-peg peg-${color}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
