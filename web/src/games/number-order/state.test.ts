import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s5 = { count: "5" as const };
const s10 = { count: "10" as const };

describe("Number Order", () => {
  it("initializes with correct count of numbers", () => {
    const s = initialState(42, s5);
    expect(s.numbers.length).toBe(5);
    expect(s.tapped).toEqual([]);
    expect(s.mistakes).toBe(0);
    expect(s.done).toBe(false);
  });

  it("numbers are distinct", () => {
    const s = initialState(42, s10);
    const unique = new Set(s.numbers);
    expect(unique.size).toBe(10);
  });

  it("nextExpected is the smallest number", () => {
    const s = initialState(42, s5);
    const smallest = Math.min(...s.numbers);
    expect(s.nextExpected).toBe(smallest);
  });

  it("tapping the correct number advances state", () => {
    const s = initialState(42, s5);
    const idx = s.numbers.indexOf(s.nextExpected);
    const next = reducer(s, { type: "tap", index: idx });
    expect(next.tapped).toContain(idx);
    expect(next.mistakes).toBe(0);
  });

  it("tapping wrong number increments mistakes", () => {
    const s = initialState(42, s5);
    const wrongIdx = s.numbers.findIndex(n => n !== s.nextExpected);
    const next = reducer(s, { type: "tap", index: wrongIdx });
    expect(next.mistakes).toBe(1);
    expect(next.tapped).not.toContain(wrongIdx);
  });

  it("game completes after tapping all in order", () => {
    let s = initialState(42, s5);
    const sorted = [...s.numbers].sort((a, b) => a - b);
    for (const n of sorted) {
      const idx = s.numbers.indexOf(n);
      s = reducer(s, { type: "tap", index: idx });
    }
    expect(s.done).toBe(true);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, s5);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns 100 with zero mistakes", () => {
    let s = initialState(42, s5);
    const sorted = [...s.numbers].sort((a, b) => a - b);
    for (const n of sorted) {
      const idx = s.numbers.indexOf(n);
      s = reducer(s, { type: "tap", index: idx });
    }
    expect(isTerminal(s)!.score).toBe(100);
  });
});
