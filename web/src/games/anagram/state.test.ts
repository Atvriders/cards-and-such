import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, sameLetters } from "./state.js";
import type { AnagramState } from "./state.js";

describe("sameLetters", () => {
  it("returns true for anagrams", () => {
    expect(sameLetters("LISTEN", "SILENT")).toBe(true);
    expect(sameLetters("HEART", "EARTH")).toBe(true);
  });

  it("returns false for different letter sets", () => {
    expect(sameLetters("APPLE", "MAPLE")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(sameLetters("ABC", "ABCD")).toBe(false);
  });

  it("returns true for identical words", () => {
    expect(sameLetters("CRANE", "CRANE")).toBe(true);
  });
});

describe("Anagram initialState", () => {
  it("target and scrambled have same length", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    expect(s.target.length).toBe(6);
    expect(s.scrambled.length).toBe(6);
  });

  it("target and scrambled use same letters", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    expect(sameLetters(s.target, s.scrambled)).toBe(true);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, { wordLength: "6", maxGuesses: "5" });
    const s2 = initialState(42, { wordLength: "6", maxGuesses: "5" });
    expect(s1.target).toBe(s2.target);
    expect(s1.scrambled).toBe(s2.scrambled);
  });

  it("works for 5-letter words", () => {
    const s = initialState(7, { wordLength: "5", maxGuesses: "5" });
    expect(s.wordLength).toBe(5);
  });

  it("starts with no guesses, not won/lost", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    expect(s.guesses.length).toBe(0);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
  });
});

describe("Anagram reducer", () => {
  it("adds letters to currentGuess", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const s2 = reducer(s, { type: "letter", char: "A" });
    expect(s2.currentGuess).toBe("A");
  });

  it("backspace removes last letter", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    let s2 = reducer(s, { type: "letter", char: "A" });
    s2 = reducer(s2, { type: "letter", char: "B" });
    s2 = reducer(s2, { type: "backspace" });
    expect(s2.currentGuess).toBe("A");
  });

  it("submit with correct word sets won=true", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const withGuess: AnagramState = { ...s, currentGuess: s.target };
    const s2 = reducer(withGuess, { type: "submit" });
    expect(s2.won).toBe(true);
    expect(s2.guesses[0]).toBe(s.target);
  });

  it("submit with wrong same-letter arrangement adds to guesses but not won", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    // Find a scrambled version that differs from target but uses same letters
    const scrambled = s.scrambled; // this is a different arrangement
    if (scrambled !== s.target) {
      const withGuess: AnagramState = { ...s, currentGuess: scrambled };
      const s2 = reducer(withGuess, { type: "submit" });
      // sameLetters(scrambled, target) is true (same letters, different order)
      // but scrambled !== target so won = false
      expect(s2.guesses.length).toBe(1);
      if (scrambled === s.target) {
        expect(s2.won).toBe(true);
      } else {
        expect(s2.won).toBe(false);
      }
    }
  });

  it("lost after maxGuesses wrong guesses", () => {
    const s = initialState(1, { wordLength: "5", maxGuesses: "3" });
    // Use scrambled (same letters, wrong word if !== target) repeatedly
    let cur = s;
    for (let i = 0; i < 3; i++) {
      // Use a made-up same-letter string that isn't the target
      const wrongGuess = s.scrambled !== s.target ? s.scrambled : s.target.split("").reverse().join("");
      cur = reducer({ ...cur, currentGuess: wrongGuess }, { type: "submit" });
    }
    if (!cur.won) {
      expect(cur.lost).toBe(true);
    }
  });

  it("no-op when already won", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const wonState: AnagramState = { ...s, won: true };
    const s2 = reducer(wonState, { type: "letter", char: "A" });
    expect(s2.currentGuess).toBe("");
  });
});

describe("Anagram isTerminal", () => {
  it("returns null when not finished", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 0 score when lost", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const lostState: AnagramState = { ...s, lost: true };
    expect(isTerminal(lostState)!.score).toBe(0);
  });

  it("returns score when won on first guess", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const wonState: AnagramState = { ...s, won: true, guesses: [s.target] };
    const result = isTerminal(wonState);
    // (5 - 1 + 1) * 200 = 1000
    expect(result!.score).toBe(1000);
  });

  it("score decreases with more guesses", () => {
    const s = initialState(1, { wordLength: "6", maxGuesses: "5" });
    const won1: AnagramState = { ...s, won: true, guesses: [s.target] };
    const won3: AnagramState = { ...s, won: true, guesses: ["A", "B", s.target] };
    expect(isTerminal(won1)!.score).toBeGreaterThan(isTerminal(won3)!.score);
  });
});
