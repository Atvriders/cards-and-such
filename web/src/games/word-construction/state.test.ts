import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { WordConstructionState } from "./state.js";

const defSettings = { duration: "60" as const };

describe("WordConstruction initialState", () => {
  it("creates 4 prefixes and empty foundWords", () => {
    const s = initialState(1, defSettings);
    expect(s.prefixes.length).toBe(4);
    expect(Object.keys(s.foundWords).length).toBe(4);
    for (const p of s.prefixes) {
      expect(s.foundWords[p]).toEqual([]);
    }
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(42, defSettings);
    const s2 = initialState(42, defSettings);
    expect(s1.prefixes).toEqual(s2.prefixes);
  });

  it("starts with 0 score and not gameOver", () => {
    const s = initialState(1, defSettings);
    expect(s.score).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("respects duration setting", () => {
    const s = initialState(1, { duration: "90" });
    expect(s.timeLeft).toBe(90);
  });
});

describe("WordConstruction reducer", () => {
  function makeState(overrides: Partial<WordConstructionState> = {}): WordConstructionState {
    return { ...initialState(1, defSettings), ...overrides };
  }

  it("type appends letter", () => {
    const s = makeState({ currentInput: "RE" });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2.currentInput).toBe("REA");
  });

  it("delete removes last char", () => {
    const s = makeState({ currentInput: "READ" });
    const s2 = reducer(s, { type: "delete" });
    expect(s2.currentInput).toBe("REA");
  });

  it("selectPrefix switches current prefix", () => {
    const s = makeState();
    const other = s.prefixes[1]!;
    const s2 = reducer(s, { type: "selectPrefix", prefix: other });
    expect(s2.currentPrefix).toBe(other);
    expect(s2.currentInput).toBe("");
  });

  it("submit accepts valid prefix word", () => {
    // Force a known prefix
    const s = makeState({
      prefixes: ["RE", "UN", "PRE", "OUT"],
      currentPrefix: "RE",
      currentInput: "RESET",
      foundWords: { RE: [], UN: [], PRE: [], OUT: [] },
      score: 0,
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords["RE"]).toContain("RESET");
    expect(s2.score).toBe(5 * 5); // 5 letters × 5 points
  });

  it("submit rejects word not starting with prefix", () => {
    const s = makeState({
      prefixes: ["RE", "UN", "PRE", "OUT"],
      currentPrefix: "RE",
      currentInput: "UNCLE",
      foundWords: { RE: [], UN: [], PRE: [], OUT: [] },
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords["RE"]).toHaveLength(0);
  });

  it("submit rejects duplicate", () => {
    const s = makeState({
      prefixes: ["RE", "UN", "PRE", "OUT"],
      currentPrefix: "RE",
      currentInput: "RESET",
      foundWords: { RE: ["RESET"], UN: [], PRE: [], OUT: [] },
    });
    const s2 = reducer(s, { type: "submit" });
    expect(s2.foundWords["RE"]?.length).toBe(1);
    expect(s2.message).toBe("Already found!");
  });

  it("tick decrements timeLeft", () => {
    const s = makeState({ timeLeft: 20 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.timeLeft).toBe(19);
  });

  it("tick ends game at 0", () => {
    const s = makeState({ timeLeft: 1 });
    const s2 = reducer(s, { type: "tick" });
    expect(s2.gameOver).toBe(true);
  });

  it("no-ops when gameOver", () => {
    const s = makeState({ gameOver: true });
    const s2 = reducer(s, { type: "type", char: "A" });
    expect(s2).toBe(s);
  });
});

describe("WordConstruction isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(1, defSettings))).toBeNull();
  });

  it("returns score when gameOver", () => {
    const s = { ...initialState(1, defSettings), gameOver: true, score: 50 };
    expect(isTerminal(s)?.score).toBe(50);
  });
});
