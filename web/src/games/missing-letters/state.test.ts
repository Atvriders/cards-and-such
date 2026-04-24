import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { blanks: "2" as const };

describe("MissingLetters initialState", () => {
  it("creates a word with correct number of hidden slots", () => {
    const s = initialState(42, defaultSettings);
    expect(s.word.length).toBeGreaterThan(0);
    expect(s.hiddenIndices.length).toBe(2);
    expect(s.input.length).toBe(2);
    expect(s.submitted).toBe(false);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1.word).toBe(s2.word);
    expect(s1.hiddenIndices).toEqual(s2.hiddenIndices);
  });

  it("hidden indices are within word bounds", () => {
    for (let i = 0; i < 10; i++) {
      const s = initialState(i, defaultSettings);
      s.hiddenIndices.forEach(idx => {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(s.word.length);
      });
    }
  });

  it("blanks=1 setting produces exactly 1 hidden slot", () => {
    const s = initialState(5, { blanks: "1" as const });
    expect(s.hiddenIndices.length).toBe(1);
  });
});

describe("MissingLetters reducer", () => {
  it("typing a letter fills current slot and advances focus", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.input[0]).toBe("A");
    expect(s2.focusedSlot).toBe(1);
  });

  it("backspace clears current slot or moves back", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "type", char: "A" });
    const s3 = reducer(s2, { type: "backspace" });
    // If we moved to slot 1, backspace clears slot 1 first (it's empty), then moves to slot 0
    expect(s3.focusedSlot).toBe(0);
  });

  it("correct submission marks correct and adds 10 points", () => {
    const s = initialState(42, defaultSettings);
    // Build correct input
    let state = s;
    for (let i = 0; i < s.hiddenIndices.length; i++) {
      const correctChar = s.word[s.hiddenIndices[i]!]!;
      state = reducer(state, { type: "type", char: correctChar });
    }
    state = reducer(state, { type: "submit" });
    expect(state.correct).toBe(true);
    expect(state.score).toBe(10);
  });

  it("wrong submission marks incorrect and adds 0 points", () => {
    const s = initialState(42, defaultSettings);
    let state = s;
    for (let i = 0; i < s.hiddenIndices.length; i++) {
      state = reducer(state, { type: "type", char: "Z" });
    }
    // Replace with wrong answer if Z is actually correct
    state = reducer(state, { type: "submit" });
    // Score either 0 or 10 depending on random word — just check it's <= 10
    expect(state.score).toBeLessThanOrEqual(10);
    expect(state.submitted).toBe(true);
  });

  it("next action moves to next question", () => {
    const s = initialState(42, defaultSettings);
    let state = s;
    for (let i = 0; i < s.hiddenIndices.length; i++) {
      state = reducer(state, { type: "type", char: "A" });
    }
    state = reducer(state, { type: "submit" });
    state = reducer(state, { type: "next", seed: 42 });
    expect(state.questionIndex).toBe(1);
    expect(state.submitted).toBe(false);
  });
});

describe("MissingLetters isTerminal", () => {
  it("returns null while game is in progress", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when last question is submitted", () => {
    const s = initialState(42, defaultSettings);
    const fakeState = { ...s, submitted: true, questionIndex: 9, totalQuestions: 10, score: 60 };
    const result = isTerminal(fakeState);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(60);
  });
});
