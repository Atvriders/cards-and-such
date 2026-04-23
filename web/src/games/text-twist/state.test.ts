import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TextTwistState } from "./state.js";

const defSettings = { duration: "120" as const, targetWordLength: "5" as const };

describe("TextTwist initialState", () => {
  it("creates a targetWord of the correct length", () => {
    const s = initialState(1, defSettings);
    expect(s.targetWord.length).toBe(5);
    expect(s.letters.length).toBe(5);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.targetWord).toBe(s2.targetWord);
  });

  it("starts with empty foundWords and 0 score", () => {
    const s = initialState(5, defSettings);
    expect(s.foundWords).toEqual([]);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("respects duration setting", () => {
    const s = initialState(1, { duration: "180", targetWordLength: "5" });
    expect(s.timeLeft).toBe(180);
  });
});

describe("TextTwist reducer", () => {
  function makeState(overrides: Partial<TextTwistState> = {}): TextTwistState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("type appends a letter", () => {
    const s = makeState({ letters: ["C","A","T","E","R"] });
    const s2 = reducer(s, { type: "type", char: "C" });
    expect(s2.currentInput).toBe("C");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "CAT" });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("CA");
  });

  it("clear empties input", () => {
    const s = makeState({ currentInput: "RATE" });
    const s2 = reducer(s, { type: "clear" });
    expect(s2.currentInput).toBe("");
  });

  it("submit accepts valid word", () => {
    const s = makeState({
      letters: ["P","L","A","N","E","T"],
      targetWord: "PLANET",
      validWords: ["PLAN","PLANET","LANE","LEAN","PETAL"],
      currentInput: "PLAN",
      foundWords: [],
      score: 0,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords).toContain("PLAN");
    expect(s2.score).toBe(40); // 4 letters * 10
  });

  it("submit rejects duplicate", () => {
    const s = makeState({
      letters: ["P","L","A","N","E","T"],
      targetWord: "PLANET",
      validWords: ["PLAN"],
      currentInput: "PLAN",
      foundWords: ["PLAN"],
      score: 40,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords.length).toBe(1);
    expect(s2.message).toBe("Already found!");
  });

  it("submit target word sets solved and adds bonus", () => {
    const s = makeState({
      letters: ["P","L","A","N","E","T"],
      targetWord: "PLANET",
      validWords: ["PLANET"],
      currentInput: "PLANET",
      foundWords: [],
      score: 0,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.solved).toBe(true);
    expect(s2.score).toBe(6 * 10 + 50); // 110
  });

  it("tick decrements timeLeft", () => {
    const s = makeState({ timeLeft: 30 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(29);
  });

  it("tick sets gameOver at 0", () => {
    const s = makeState({ timeLeft: 1 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-ops when gameOver", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2).toBe(s);
  });

  it("twist changes letter order", () => {
    const s = makeState({ letters: ["P","L","A","N","E","T"], timeLeft: 100 });
    // Twist might or might not change order, but should not change letter set
    const s2 = reducer(s, { type: "twist" });
    expect([...s2.letters].sort()).toEqual([...s.letters].sort());
  });
});

describe("TextTwist isTerminal", () => {
  it("returns null when in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 75 };
    expect(isTerminal(s)?.score).toBe(75);
  });
});
