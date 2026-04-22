import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { JustOneState } from "./state.js";

describe("initialState", () => {
  it("starts at round 1 with a target word", () => {
    const s = initialState(42);
    expect(s.round).toBe(1);
    expect(s.targetWord.length).toBeGreaterThan(2);
  });

  it("has 3 raw clues from bots", () => {
    const s = initialState(42);
    expect(s.rawClues).toHaveLength(3);
  });

  it("starts with empty guess, not submitted", () => {
    const s = initialState(42);
    expect(s.guess).toBe("");
    expect(s.submitted).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(7);
    const s2 = initialState(7);
    expect(s1.targetWord).toBe(s2.targetWord);
    expect(s1.rawClues).toEqual(s2.rawClues);
  });
});

describe("duplicate clue cancellation", () => {
  it("visible clues never include canceled ones", () => {
    const s = initialState(42);
    const canceled = new Set(s.canceledIndices);
    const expectedVisible = s.rawClues.filter((_, i) => !canceled.has(i));
    expect(s.visibleClues).toEqual(expectedVisible);
  });
});

describe("reducer - typeGuess", () => {
  it("updates guess text", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "typeGuess", text: "APPLE" });
    expect(s2.guess).toBe("APPLE");
  });

  it("converts to uppercase and strips non-alpha", () => {
    const s = initialState(1);
    const s2 = reducer(s, { type: "typeGuess", text: "test123" });
    expect(s2.guess).toBe("TEST");
  });

  it("no change after submitted", () => {
    const s: JustOneState = { ...initialState(1), submitted: true };
    const s2 = reducer(s, { type: "typeGuess", text: "NEW" });
    expect(s2).toBe(s);
  });
});

describe("reducer - submitGuess", () => {
  it("win when guess matches target", () => {
    const s = initialState(5);
    const withGuess = reducer(s, { type: "typeGuess", text: s.targetWord });
    const s2 = reducer(withGuess, { type: "submitGuess" });
    expect(s2.won).toBe(true);
    expect(s2.score).toBe(100);
  });

  it("lose when guess does not match", () => {
    const s = initialState(5);
    const withGuess = reducer(s, { type: "typeGuess", text: "ZZZZZ" });
    const s2 = reducer(withGuess, { type: "submitGuess" });
    expect(s2.won).toBe(false);
    expect(s2.score).toBe(0);
  });

  it("no submit when guess is empty", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "submitGuess" });
    expect(s2).toBe(s);
  });
});

describe("reducer - nextRound", () => {
  it("advances to round 2", () => {
    let s = initialState(2);
    s = reducer(s, { type: "typeGuess", text: s.targetWord });
    s = reducer(s, { type: "submitGuess" });
    const s2 = reducer(s, { type: "nextRound" });
    expect(s2.round).toBe(2);
    expect(s2.submitted).toBe(false);
  });
});

describe("isTerminal", () => {
  it("returns null when game is ongoing", () => {
    expect(isTerminal(initialState(3))).toBeNull();
  });

  it("returns score after final round submitted", () => {
    let s = initialState(3);
    // Play through all 5 rounds
    for (let i = 0; i < s.totalRounds; i++) {
      s = reducer(s, { type: "typeGuess", text: s.targetWord });
      s = reducer(s, { type: "submitGuess" });
      if (i < s.totalRounds - 1) {
        s = reducer(s, { type: "nextRound" });
      }
    }
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
