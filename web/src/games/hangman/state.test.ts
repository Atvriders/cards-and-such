import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { HangmanState } from "./state.js";

const defaultSettings = { wordLength: "any" as const, maxWrong: "6" as const };

describe("Hangman initialState", () => {
  it("starts with empty guessed list and 0 wrong guesses", () => {
    const s = initialState(42, defaultSettings);
    expect(s.guessed).toEqual([]);
    expect(s.wrongGuesses).toBe(0);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
    expect(s.target.length).toBeGreaterThan(0);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.target).toBe(s2.target);
    expect(s1.maxWrongNum).toBe(6);
  });

  it("respects wordLength filter (short)", () => {
    // Short = 4-5 letters. Run a few seeds and check
    for (let i = 0; i < 20; i++) {
      const s = initialState(i, { wordLength: "short", maxWrong: "6" });
      expect(s.target.length).toBeGreaterThanOrEqual(4);
      expect(s.target.length).toBeLessThanOrEqual(5);
    }
  });

  it("respects wordLength filter (long)", () => {
    for (let i = 0; i < 20; i++) {
      const s = initialState(i, { wordLength: "long", maxWrong: "6" });
      expect(s.target.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("sets maxWrongNum from settings", () => {
    const s = initialState(1, { wordLength: "any", maxWrong: "10" });
    expect(s.maxWrongNum).toBe(10);
  });
});

describe("Hangman guess", () => {
  it("adds correct letter to guessed and does NOT increment wrongGuesses", () => {
    const s = initialState(42, defaultSettings);
    const firstLetter = s.target[0]!;
    const s2 = reducer(s, { type: "guess", letter: firstLetter });
    expect(s2.guessed).toContain(firstLetter);
    expect(s2.wrongGuesses).toBe(0);
  });

  it("adds wrong letter to guessed and increments wrongGuesses", () => {
    const s = initialState(42, defaultSettings);
    // Find a letter NOT in the target
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const wrongLetter = allLetters.find(l => !s.target.includes(l))!;
    const s2 = reducer(s, { type: "guess", letter: wrongLetter });
    expect(s2.guessed).toContain(wrongLetter);
    expect(s2.wrongGuesses).toBe(1);
  });

  it("ignores duplicate guesses", () => {
    const s = initialState(42, defaultSettings);
    const firstLetter = s.target[0]!;
    const s2 = reducer(s, { type: "guess", letter: firstLetter });
    const s3 = reducer(s2, { type: "guess", letter: firstLetter });
    expect(s3.guessed.filter(l => l === firstLetter).length).toBe(1);
    expect(s3.wrongGuesses).toBe(s2.wrongGuesses);
  });

  it("ignores non-letter input", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "guess", letter: "1" });
    expect(s2.guessed).toEqual([]);
    const s3 = reducer(s, { type: "guess", letter: "" });
    expect(s3.guessed).toEqual([]);
  });

  it("normalizes lowercase to uppercase", () => {
    const s = initialState(42, defaultSettings);
    const firstLetter = s.target[0]!;
    const s2 = reducer(s, { type: "guess", letter: firstLetter.toLowerCase() });
    expect(s2.guessed).toContain(firstLetter.toUpperCase());
  });

  it("marks won when all letters guessed", () => {
    const base = initialState(42, defaultSettings);
    const target = "CAT";
    const s: HangmanState = { ...base, target, guessed: [], wrongGuesses: 0, won: false, lost: false };
    const s1 = reducer(s, { type: "guess", letter: "C" });
    const s2 = reducer(s1, { type: "guess", letter: "A" });
    const s3 = reducer(s2, { type: "guess", letter: "T" });
    expect(s3.won).toBe(true);
    expect(s3.lost).toBe(false);
  });

  it("marks lost when wrongGuesses reaches maxWrongNum", () => {
    const base = initialState(42, defaultSettings);
    const target = "Z";
    const s: HangmanState = { ...base, target, guessed: [], wrongGuesses: 5, won: false, lost: false, maxWrongNum: 6 };
    // One more wrong guess
    const s2 = reducer(s, { type: "guess", letter: "X" });
    expect(s2.lost).toBe(true);
    expect(s2.won).toBe(false);
  });

  it("does not accept guesses after game is over", () => {
    const base = initialState(42, defaultSettings);
    const s: HangmanState = { ...base, won: true };
    const s2 = reducer(s, { type: "guess", letter: "A" });
    expect(s2).toBe(s); // same reference (no-op)
  });
});

describe("Hangman isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns non-null score > 0 when won", () => {
    const base = initialState(42, defaultSettings);
    const s: HangmanState = { ...base, won: true, wrongGuesses: 2, maxWrongNum: 6, target: "RIVER" };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    // score = (6-2)*50 + 5*10 = 200 + 50 = 250
    expect(result?.score).toBe(250);
  });

  it("returns score 0 when lost", () => {
    const base = initialState(42, defaultSettings);
    const s: HangmanState = { ...base, lost: true };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(0);
  });
});
