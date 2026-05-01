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
      <div className="crg-title">Cryptogram</div>
      <div className={`crg-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${state.score}`
          : `Guesses: ${state.guesses} · Hints: ${state.hintsUsed} — decode the quote`}
      </div>

      <div className="crg-text">
        {words.map((word, wi) => (
          <span key={wi} className="crg-word">
            {word.split("").map((ch, ci) => {
              const isLetter = /[A-Z]/.test(ch);
              const guess = isLetter ? decryptMap[ch] : null;
              const isRevealed = isLetter && !!revealed[ch];
              const isSel = ch === selectedCipher;
              return (
                <span
                  key={ci}
                  className={[
                    "crg-letter",
                    isLetter ? "clickable" : "punct",
                    isSel ? "selected" : "",
                    isRevealed ? "revealed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => isLetter && handleCipherClick(ch)}
                  data-testid={`cipher-${wi}-${ci}`}
                >
                  <span className="crg-plain">{guess ?? (isLetter ? "_" : ch)}</span>
                  <span className="crg-cipher">{isLetter ? ch : ""}</span>
                </span>
              );
            })}
          </span>
        ))}
      </div>

      {!won && (
        <>
          {selectedCipher && (
            <div className="crg-sel-label">
              Assigning plain letter for cipher: <strong>{selectedCipher}</strong>
            </div>
          )}
          <div className="crg-alpha">
            {ALPHA.map((pl) => (
              <button
                key={pl}
                className={`crg-alpha-btn${selectedCipher ? "" : " disabled"}`}
                onClick={() => selectedCipher && handlePlain(pl)}
                data-testid={`plain-${pl}`}
              >
                {pl}
              </button>
            ))}
          </div>
          <div className="crg-actions">
            <button
              className="crg-action-btn"
              onClick={() => dispatch({ type: "clearGuess" } satisfies CryptogramAction)}
              disabled={!selectedCipher}
            >
              Clear
            </button>
            <button
              className="crg-action-btn hint"
              onClick={() => dispatch({ type: "hint" } satisfies CryptogramAction)}
            >
              Hint (−100 pts)
            </button>
          </div>
        </>
      )}

      {won && (
        <div className="crg-reveal">
          <div className="crg-reveal-label">Decoded quote:</div>
          <div className="crg-reveal-text">{state.plaintext}</div>
        </div>
      )}

      <div className="crg-hint">
        Click a cipher letter (top row), then click the plain letter you think it represents.
      </div>
    </div>
  );
}
