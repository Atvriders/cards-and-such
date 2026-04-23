import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SpellingBeeState } from "./state.js";

const defSettings = { duration: "180" as const, difficulty: "medium" as const };

describe("SpellingBee initialState", () => {
  it("produces 7 letters with a center letter", () => {
    const s = initialState(1, defSettings);
    expect(s.letters.length).toBe(7);
    expect(s.centerLetter).toBe(s.letters[0]);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.letters).toEqual(s2.letters);
  });

  it("starts with empty foundWords and zero score", () => {
    const s = initialState(7, defSettings);
    expect(s.foundWords).toEqual([]);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("respects duration setting", () => {
    const s = initialState(1, { duration: "60", difficulty: "medium" });
    expect(s.timeLeft).toBe(60);
  });
});

describe("SpellingBee reducer", () => {
  function makeState(overrides: Partial<SpellingBeeState> = {}): SpellingBeeState {
    const base = initialState(1, defSettings);
    return { ...base, ...overrides };
  }

  it("type action appends uppercase char", () => {
    const s = makeState();
    const s2 = reducer(s, { type: "type", char: "a" });
    expect(s2.currentInput).toBe("A");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "CAT" });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("CA");
  });

  it("clear empties input", () => {
    const s = makeState({ currentInput: "HELLO" });
    const s2 = reducer(s, { type: "clear" });
    expect(s2.currentInput).toBe("");
  });

  it("submit adds score for valid word containing center letter", () => {
    const s = makeState({
      letters: ["A", "C", "T", "S", "E", "R", "N"],
      centerLetter: "A",
      validWords: ["ACES", "CARES", "CRANE", "TRACE", "CANTER", "STAR", "RACE", "SCAR", "SCAN", "RENTS"],
      foundWords: [],
      currentInput: "CARES",
      score: 0,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords).toContain("CARES");
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.currentInput).toBe("");
  });

  it("submit rejects word not in validWords", () => {
    const s = makeState({ currentInput: "QQQQ", centerLetter: "Q", letters: ["Q","A","B","C","D","E","F"], validWords: [] });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords).toHaveLength(0);
    expect(s2.message).toBe("Not in word list");
  });

  it("submit rejects duplicate word", () => {
    const s = makeState({
      letters: ["A", "C", "T", "S", "E", "R", "N"],
      centerLetter: "A",
      validWords: ["CANE"],
      foundWords: ["CANE"],
      currentInput: "CANE",
      score: 5,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords.length).toBe(1);
    expect(s2.message).toBe("Already found!");
  });

  it("submit rejects word missing center letter", () => {
    const s = makeState({
      letters: ["A", "C", "T", "S", "E", "R", "N"],
      centerLetter: "A",
      validWords: ["TEST"],
      foundWords: [],
      currentInput: "TEST",
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords).toHaveLength(0);
  });

  it("tick decrements timeLeft", () => {
    const s = makeState({ timeLeft: 10, gameOver: false });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(9);
  });

  it("tick sets gameOver when timeLeft hits 0", () => {
    const s = makeState({ timeLeft: 1, gameOver: false });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-ops when game is over", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.currentInput).toBe(s.currentInput);
  });
});

describe("SpellingBee isTerminal", () => {
  it("returns null when in progress", () => {
    const s = initialState(1, defSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 42 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBe(42);
  });
});
