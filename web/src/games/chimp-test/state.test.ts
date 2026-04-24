import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings4Med = { startCount: "4" as const, difficulty: "medium" as const };
const settings5Easy = { startCount: "5" as const, difficulty: "easy" as const };

describe("ChimpTest initialState", () => {
  it("starts in show phase with correct count", () => {
    const s = initialState(42, settings4Med);
    expect(s.phase).toBe("show");
    expect(s.count).toBe(4);
    expect(s.cells.length).toBe(4);
  });

  it("same seed produces same cells", () => {
    const s1 = initialState(7, settings4Med);
    const s2 = initialState(7, settings4Med);
    expect(s1.cells).toEqual(s2.cells);
  });

  it("cells have unique positions", () => {
    const s = initialState(42, settings5Easy);
    const positions = s.cells.map(c => `${c.x},${c.y}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(s.cells.length);
  });

  it("cells are numbered 1..N", () => {
    const s = initialState(42, settings4Med);
    const numbers = s.cells.map(c => c.number).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4]);
  });
});

describe("ChimpTest start action", () => {
  it("transitions from show to recall on start", () => {
    const s = initialState(42, settings4Med);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("recall");
  });

  it("start does nothing in non-show phase", () => {
    const s = initialState(42, settings4Med);
    const recall = reducer(s, { type: "start" });
    const again = reducer(recall, { type: "start" });
    expect(again.phase).toBe("recall");
  });
});

describe("ChimpTest click action", () => {
  it("clicking correct number advances expected", () => {
    const s = initialState(42, settings4Med);
    const recall = reducer(s, { type: "start" });
    const s2 = reducer(recall, { type: "click", number: 1 });
    expect(s2.expected).toBe(2);
  });

  it("clicking wrong number loses a life", () => {
    const s = initialState(42, settings4Med);
    const recall = reducer(s, { type: "start" });
    const s2 = reducer(recall, { type: "click", number: 3 }); // wrong, expected 1
    expect(s2.lives).toBe(2);
  });

  it("completing a round increases count and score", () => {
    const s = initialState(42, settings4Med);
    let state = reducer(s, { type: "start" });
    for (let i = 1; i <= 4; i++) {
      state = reducer(state, { type: "click", number: i });
    }
    expect(state.score).toBe(4);
    expect(state.count).toBe(5); // medium adds 1
    expect(state.phase).toBe("show");
  });

  it("game ends when all lives gone", () => {
    let s = initialState(42, settings4Med);
    s = reducer(s, { type: "start" });
    // Click wrong 3 times to drain lives
    for (let i = 0; i < 3; i++) {
      if (s.phase === "show") s = reducer(s, { type: "start" });
      s = reducer(s, { type: "click", number: 99 });
    }
    expect(s.phase).toBe("done");
  });
});

describe("ChimpTest isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(42, settings4Med);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when done", () => {
    const s = { ...initialState(42, settings4Med), phase: "done" as const, score: 12 };
    expect(isTerminal(s)?.score).toBe(12);
  });
});
