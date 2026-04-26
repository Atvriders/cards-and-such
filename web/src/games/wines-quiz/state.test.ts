import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { questionCount: "5" as const };

describe("WinesQuiz state", () => {
  it("creates correct number of entries", () => {
    const s = initialState(42, defaultSettings);
    expect(s.entries.length).toBe(5);
    expect(s.current).toBe(0);
    expect(s.score).toBe(0);
    expect(s.done).toBe(false);
  });

  it("each entry has 4 choices including the answer", () => {
    const s = initialState(99, defaultSettings);
    for (const entry of s.entries) {
      expect(entry.choices.length).toBe(4);
      expect(entry.choices).toContain(entry.answer);
    }
  });

  it("correct selection increases score by 10", () => {
    const s = initialState(42, defaultSettings);
    const entry = s.entries[0]!;
    const correctIdx = entry.choices.indexOf(entry.answer);
    const s2 = reducer(s, { type: "select", index: correctIdx });
    expect(s2.score).toBe(10);
  });

  it("completing all questions sets done to true and isTerminal returns score", () => {
    let s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "select", index: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.done).toBe(true);
    expect(isTerminal(s)?.score).toBeDefined();
  });
});
