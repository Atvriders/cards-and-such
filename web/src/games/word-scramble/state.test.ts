import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { difficulty: "medium" as const };

describe("WordScramble initialState", () => {
  it("produces a target word and scrambled version", () => {
    const s = initialState(42, defaultSettings);
    expect(s.targetWord.length).toBeGreaterThan(0);
    expect(s.scrambled.length).toBe(s.targetWord.length);
    expect(s.input).toBe("");
    expect(s.solved).toBe(false);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.targetWord).toBe(s2.targetWord);
    expect(s1.scrambled).toBe(s2.scrambled);
  });

  it("scrambled letters are an anagram of the target", () => {
    for (let i = 0; i < 10; i++) {
      const s = initialState(i, defaultSettings);
      const sortedTarget = s.targetWord.split("").sort().join("");
      const sortedScrambled = s.scrambled.split("").sort().join("");
      expect(sortedScrambled).toBe(sortedTarget);
    }
  });

  it("easy difficulty uses short words (3 letters)", () => {
    const s = initialState(5, { difficulty: "easy" as const });
    expect(s.targetWord.length).toBe(3);
  });
});

describe("WordScramble reducer", () => {
  it("typing appends characters to input", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.input).toBe("A");
  });

  it("backspace removes last character", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "type", char: "A" });
    const s3 = reducer(s2, { type: "backspace" });
    expect(s3.input).toBe("");
  });

  it("correct submission increases score", () => {
    const s = initialState(42, defaultSettings);
    // Force a known word
    const fakeState = { ...s, targetWord: "CAT", scrambled: "ACT", input: "CAT", questionIndex: 9, totalQuestions: 10 };
    const s2 = reducer(fakeState, { type: "submit" });
    expect(s2.solved).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("wrong submission does not change score", () => {
    const s = initialState(42, defaultSettings);
    const fakeState = { ...s, targetWord: "CAT", scrambled: "ACT", input: "DOG" };
    const s2 = reducer(fakeState, { type: "submit" });
    expect(s2.score).toBe(s.score);
  });

  it("hint reveals first letter and increases hintsUsed", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "hint" });
    expect(s2.hintsUsed).toBe(1);
    expect(s2.hintsRevealed).toBe(1);
    expect(s2.input).toBe(s2.targetWord[0]);
  });

  it("skip moves to next question without scoring", () => {
    const s = initialState(42, defaultSettings);
    const scoreBefore = s.score;
    const s2 = reducer(s, { type: "skip" });
    expect(s2.score).toBe(scoreBefore);
    expect(s2.questionIndex).toBe(1);
  });
});

describe("WordScramble isTerminal", () => {
  it("returns null when game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when solved is true", () => {
    const s = initialState(42, defaultSettings);
    const fakeState = { ...s, solved: true, score: 200 };
    const result = isTerminal(fakeState);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(200);
  });
});
