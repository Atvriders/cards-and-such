import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CryptogramState, CryptogramSettings } from "./state.js";
import { type CryptogramAction, isTerminal } from "./state.js";
import "./Game.css";

export function Cryptogram({
  state,
  dispatch,
  onGameOver,
}: GameProps<CryptogramState, CryptogramSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { ciphertext, decryptMap, revealed, selectedCipher, won } = state;

  // Parse ciphertext into words/tokens
  const words = ciphertext.split(" ");

  function handleCipherClick(letter: string) {
    if (won || revealed[letter]) return;
    dispatch({ type: "selectCipher", letter } satisfies CryptogramAction);
  }

  function handlePlain(pl: string) {
    dispatch({ type: "guessLetter", plainLetter: pl } satisfies CryptogramAction);
  }

  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="crypto">
      <div className="crypto-title">Cryptogram</div>
      <div className={`crypto-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${state.score}`
          : `Guesses: ${state.guesses} · Hints: ${state.hintsUsed} — decode the quote`}
      </div>

      <div className="crypto-text">
        {words.map((word, wi) => (
          <span key={wi} className="crypto-word">
            {word.split("").map((ch, ci) => {
              const isLetter = /[A-Z]/.test(ch);
              const guess = isLetter ? decryptMap[ch] : null;
              const isRevealed = isLetter && !!revealed[ch];
              const isSel = ch === selectedCipher;
              return (
                <span
                  key={ci}
                  className={[
                    "crypto-letter",
                    isLetter ? "clickable" : "punct",
                    isSel ? "selected" : "",
                    isRevealed ? "revealed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => isLetter && handleCipherClick(ch)}
                  data-testid={`cipher-${wi}-${ci}`}
                >
                  <span className="crypto-plain">{guess ?? (isLetter ? "_" : ch)}</span>
                  <span className="crypto-cipher">{isLetter ? ch : ""}</span>
                </span>
              );
            })}
          </span>
        ))}
      </div>

      {!won && (
        <>
          {selectedCipher && (
            <div className="crypto-sel-label">
              Assigning plain letter for cipher: <strong>{selectedCipher}</strong>
            </div>
          )}
          <div className="crypto-alpha">
            {ALPHA.map((pl) => (
              <button
                key={pl}
                className={`crypto-alpha-btn${selectedCipher ? "" : " disabled"}`}
                onClick={() => selectedCipher && handlePlain(pl)}
                data-testid={`plain-${pl}`}
              >
                {pl}
              </button>
            ))}
          </div>
          <div className="crypto-actions">
            <button
              className="crypto-action-btn"
              onClick={() => dispatch({ type: "clearGuess" } satisfies CryptogramAction)}
              disabled={!selectedCipher}
            >
              Clear
            </button>
            <button
              className="crypto-action-btn hint"
              onClick={() => dispatch({ type: "hint" } satisfies CryptogramAction)}
            >
              Hint (−100 pts)
            </button>
          </div>
        </>
      )}

      {won && (
        <div className="crypto-reveal">
          <div className="crypto-reveal-label">Decoded quote:</div>
          <div className="crypto-reveal-text">{state.plaintext}</div>
        </div>
      )}

      <div className="crypto-hint">
        Click a cipher letter (top row), then click the plain letter you think it represents.
      </div>
    </div>
  );
}
