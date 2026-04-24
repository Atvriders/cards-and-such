import { useEffect, useCallback, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CipherCrackState, CipherCrackSettings, CipherCrackAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CipherCrackGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CipherCrackState, CipherCrackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedCipher, setSelectedCipher] = useState<string | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleCipherClick = useCallback((letter: string) => {
    setSelectedCipher((prev) => prev === letter ? null : letter);
  }, []);

  const handlePlainInput = useCallback(
    (cipherLetter: string, value: string) => {
      if (terminal) return;
      const plain = value.replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase() || null;
      dispatch({ type: "assign", cipherLetter, plainLetter: plain } as CipherCrackAction);
    },
    [dispatch, terminal],
  );

  const { ciphertext, guesses, mapping } = state;

  // Get unique cipher letters used
  const usedCipherLetters = new Set(ciphertext.replace(/ /g, "").split(""));

  // Decode current ciphertext with guesses
  const decoded = ciphertext
    .split("")
    .map((ch) => {
      if (ch === " ") return " ";
      const idx = ch.charCodeAt(0) - 65;
      return guesses[idx] ?? "_";
    })
    .join("");

  return (
    <div className="cipher-crack">
      <div className="cipher-crack-info">
        <span>Length: {state.settings.length}</span>
        <span>Guesses: {state.movesMade}</span>
      </div>
      <div className={`cipher-crack-status${state.won ? " win" : ""}`}>
        {state.won ? "Cipher cracked! Well done!" : "Decode the substitution cipher"}
      </div>

      <div className="cipher-crack-ciphertext">{ciphertext}</div>
      <div className="cipher-crack-decoded">{decoded}</div>

      <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#666", alignSelf: "flex-start" }}>
        Assign plaintext letters to cipher letters:
      </div>

      <div className="cipher-crack-mapping">
        {Array.from(usedCipherLetters).sort().map((cipherLetter) => {
          const idx = cipherLetter.charCodeAt(0) - 65;
          const guess = guesses[idx] ?? "";
          const isCorrect = guess === mapping[idx];
          return (
            <div key={cipherLetter} className="cipher-crack-entry">
              <div
                className={`cipher-crack-cipher-btn${selectedCipher === cipherLetter ? " selected" : ""}${isCorrect ? " correct" : ""}`}
                onClick={() => handleCipherClick(cipherLetter)}
              >
                {cipherLetter}
              </div>
              <input
                className="cipher-crack-plain-input"
                type="text"
                maxLength={1}
                value={guess}
                onChange={(e) => handlePlainInput(cipherLetter, e.target.value)}
                disabled={!!terminal}
              />
            </div>
          );
        })}
      </div>

      <p className="cipher-crack-hint">
        Each cipher letter maps to a unique plaintext letter. Look for patterns: common letters (E, T, A) and short words (A, I, THE, AND).
      </p>
    </div>
  );
}
