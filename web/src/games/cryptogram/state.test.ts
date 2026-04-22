import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Cryptogram", () => {
  it("initialState creates ciphertext different from plaintext", () => {
    const s = initialState(1, { difficulty: "hard" });
    expect(s.plaintext).not.toBe(s.ciphertext);
    expect(s.plaintext.length).toBe(s.ciphertext.length);
  });

  it("easy difficulty pre-reveals 3 letters", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(Object.keys(s.revealed).length).toBe(3);
    // All revealed should be correct
    for (const [cipher, plain] of Object.entries(s.revealed)) {
      expect(s.encryptMap[plain]).toBe(cipher);
    }
  });

  it("hard difficulty pre-reveals 0 letters", () => {
    const s = initialState(1, { difficulty: "hard" });
    expect(Object.keys(s.revealed).length).toBe(0);
  });

  it("selectCipher sets selectedCipher", () => {
    const s = initialState(2, { difficulty: "hard" });
    // Find a cipher letter that exists in the ciphertext and is not revealed
    const cl = [...new Set(s.ciphertext.split("").filter((c) => /[A-Z]/.test(c) && !s.revealed[c]))][0]!;
    const next = reducer(s, { type: "selectCipher", letter: cl });
    expect(next.selectedCipher).toBe(cl);
  });

  it("guessLetter assigns a mapping", () => {
    const s = initialState(2, { difficulty: "hard" });
    const cl = [...new Set(s.ciphertext.split("").filter((c) => /[A-Z]/.test(c) && !s.revealed[c]))][0]!;
    const s2 = reducer(s, { type: "selectCipher", letter: cl });
    const s3 = reducer(s2, { type: "guessLetter", plainLetter: "A" });
    expect(s3.decryptMap[cl]).toBe("A");
    expect(s3.guesses).toBe(1);
    expect(s3.selectedCipher).toBe(null);
  });

  it("clearGuess removes a mapping", () => {
    const s = initialState(2, { difficulty: "hard" });
    const cl = [...new Set(s.ciphertext.split("").filter((c) => /[A-Z]/.test(c) && !s.revealed[c]))][0]!;
    const s2 = reducer(s, { type: "selectCipher", letter: cl });
    const s3 = reducer(s2, { type: "guessLetter", plainLetter: "Z" });
    const s4 = reducer(s3, { type: "selectCipher", letter: cl });
    const s5 = reducer(s4, { type: "clearGuess" });
    expect(s5.decryptMap[cl]).toBeUndefined();
  });

  it("hint reveals a letter and increments hintsUsed", () => {
    const s = initialState(3, { difficulty: "hard" });
    const s2 = reducer(s, { type: "hint" });
    expect(s2.hintsUsed).toBe(1);
    expect(Object.keys(s2.revealed).length).toBe(1);
    // Revealed letter should be correct
    const [cl, pl] = Object.entries(s2.revealed)[0]!;
    expect(s2.encryptMap[pl]).toBe(cl);
  });

  it("won becomes true when all letters are correctly decoded", () => {
    const s = initialState(10, { difficulty: "hard" });
    // Build the reverse map (cipher -> plain)
    const invMap: Record<string, string> = {};
    for (const [plain, cipher] of Object.entries(s.encryptMap)) {
      invMap[cipher] = plain;
    }
    // Find all unique cipher letters
    const cipherLetters = [...new Set(s.ciphertext.split("").filter((c) => /[A-Z]/.test(c)))];
    let state = s;
    for (const cl of cipherLetters) {
      const pl = invMap[cl]!;
      state = reducer(state, { type: "selectCipher", letter: cl });
      state = reducer(state, { type: "guessLetter", plainLetter: pl });
    }
    expect(state.won).toBe(true);
    expect(isTerminal(state)?.score).toBeGreaterThanOrEqual(100);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(isTerminal(s)).toBe(null);
  });

  it("medium difficulty pre-reveals 1 letter", () => {
    const s = initialState(5, { difficulty: "medium" });
    expect(Object.keys(s.revealed).length).toBe(1);
  });
});
