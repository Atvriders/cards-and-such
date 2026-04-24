import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const med = { difficulty: "medium" as const };

describe("WheelSpin initialState", () => {
  it("creates a puzzle with revealed array matching word length", () => {
    const s = initialState(1, med);
    expect(s.revealed.length).toBe(s.puzzle.word.length);
    expect(s.revealed.every(v => v === false)).toBe(true);
  });

  it("starts in spinning phase", () => {
    const s = initialState(1, med);
    expect(s.phase).toBe("spinning");
    expect(s.score).toBe(0);
    expect(s.spinValue).toBeNull();
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, med);
    const s2 = initialState(42, med);
    expect(s1.puzzle.word).toBe(s2.puzzle.word);
  });

  it("medium difficulty has 5 rounds and 6 max wrong", () => {
    const s = initialState(1, med);
    expect(s.totalRounds).toBe(5);
    expect(s.maxWrong).toBe(6);
  });
});

describe("WheelSpin reducer", () => {
  it("spin transitions to guessing phase and sets spin value", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "spin" });
    expect(s2.phase).toBe("guessing");
    expect(s2.spinValue).toBeGreaterThan(0);
  });

  it("guessing a correct consonant reveals letters and adds score", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "spin" });
    // find first consonant in the word
    const word = s2.puzzle.word;
    const consonant = word.split("").find(ch => !"AEIOU".includes(ch))!;
    const count = word.split("").filter(c => c === consonant).length;
    const s3 = reducer(s2, { type: "guess_consonant", letter: consonant });
    expect(s3.score).toBe(count * s2.spinValue!);
    expect(s3.revealed.filter(Boolean).length).toBe(count);
  });

  it("wrong consonant guess increments wrongGuesses and returns to spinning", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "spin" });
    // Find a letter NOT in the word
    const word = s2.puzzle.word;
    const missing = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find(ch => !word.includes(ch) && !"AEIOU".includes(ch))!;
    const s3 = reducer(s2, { type: "guess_consonant", letter: missing });
    expect(s3.wrongGuesses).toBe(1);
    expect(s3.phase).toBe("spinning");
    expect(s3.score).toBe(0);
  });

  it("buying vowel costs 250 and reveals all occurrences", () => {
    const s = { ...initialState(1, med), score: 500, phase: "spinning" as const };
    const word = s.puzzle.word;
    const vowel = "AEIOU".split("").find(v => word.includes(v))!;
    const count = word.split("").filter(c => c === vowel).length;
    const s2 = reducer(s, { type: "buy_vowel", letter: vowel });
    expect(s2.score).toBe(250);
    expect(s2.revealed.filter(Boolean).length).toBe(count);
  });

  it("correct solve gives bonus and sets phase to won", () => {
    const s = initialState(1, med);
    const s2 = reducer(s, { type: "spin" });
    const s3 = reducer(s2, { type: "solve", word: s2.puzzle.word });
    expect(s3.phase).toBe("won");
    expect(s3.score).toBe(500);
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(1, med);
    expect(isTerminal(s)).toBeNull();
  });
});
