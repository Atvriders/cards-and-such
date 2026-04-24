import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { CipherCrackState } from "./state.js";

describe("CipherCrack initialState", () => {
  it("ciphertext and plaintext are same length", () => {
    const s = initialState(1, { length: "medium" });
    expect(s.ciphertext.length).toBe(s.plaintext.length);
  });

  it("mapping array has 26 entries", () => {
    const s = initialState(1, { length: "medium" });
    expect(s.mapping.length).toBe(26);
  });

  it("all guesses start null", () => {
    const s = initialState(1, { length: "medium" });
    expect(s.guesses.every((g) => g === null)).toBe(true);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, { length: "short" });
    const s2 = initialState(42, { length: "short" });
    expect(s1.ciphertext).toBe(s2.ciphertext);
    expect(s1.plaintext).toBe(s2.plaintext);
  });

  it("ciphertext differs from plaintext (cipher was applied)", () => {
    const s = initialState(5, { length: "medium" });
    // At least some letters should differ
    const plainLetters = s.plaintext.replace(/ /g, "");
    const cipherLetters = s.ciphertext.replace(/ /g, "");
    const allSame = plainLetters.split("").every((ch, i) => ch === cipherLetters[i]);
    expect(allSame).toBe(false);
  });
});

describe("CipherCrack reducer", () => {
  it("assign sets a guess for a cipher letter", () => {
    const s = initialState(1, { length: "short" });
    const firstCipherLetter = s.ciphertext.replace(/ /g, "")[0]!;
    const s2 = reducer(s, { type: "assign", cipherLetter: firstCipherLetter, plainLetter: "A" });
    const idx = firstCipherLetter.charCodeAt(0) - 65;
    expect(s2.guesses[idx]).toBe("A");
    expect(s2.movesMade).toBe(1);
  });

  it("assign null clears a guess", () => {
    const s = initialState(1, { length: "short" });
    const letter = s.ciphertext.replace(/ /g, "")[0]!;
    const s2 = reducer(s, { type: "assign", cipherLetter: letter, plainLetter: "A" });
    const s3 = reducer(s2, { type: "assign", cipherLetter: letter, plainLetter: null });
    const idx = letter.charCodeAt(0) - 65;
    expect(s3.guesses[idx]).toBeNull();
  });

  it("no-op when already won", () => {
    const s = initialState(1, { length: "short" });
    const won: CipherCrackState = { ...s, won: true };
    const s2 = reducer(won, { type: "assign", cipherLetter: "A", plainLetter: "B" });
    expect(s2.movesMade).toBe(0);
  });

  it("wins when all cipher letters are correctly guessed", () => {
    const s = initialState(1, { length: "short" });
    let cur: CipherCrackState = s;
    // Assign correct mappings for all used cipher letters
    const usedCipher = new Set(s.ciphertext.replace(/ /g, "").split(""));
    for (const cl of usedCipher) {
      const idx = cl.charCodeAt(0) - 65;
      const correctPlain = s.mapping[idx]!;
      cur = reducer(cur, { type: "assign", cipherLetter: cl, plainLetter: correctPlain });
    }
    expect(cur.won).toBe(true);
  });
});

describe("CipherCrack isTerminal", () => {
  it("returns null when not solved", () => {
    expect(isTerminal(initialState(1, { length: "short" }))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, { length: "short" });
    const won: CipherCrackState = { ...s, won: true, movesMade: 5 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });
});
