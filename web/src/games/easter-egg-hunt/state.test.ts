import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROWS, COLS } from "./state.js";

const settings = { eggs: "5" as const };

describe("initialState", () => {
  it("places correct number of eggs", () => {
    const s = initialState(1, settings);
    expect(s.eggPositions.size).toBe(5);
    expect(s.found).toBe(0);
    expect(s.misses).toBe(0);
    expect(s.over).toBe(false);
  });

  it("all egg positions within grid bounds", () => {
    const s = initialState(99, settings);
    const total = ROWS * COLS;
    for (const pos of s.eggPositions) {
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThan(total);
    }
  });
});

describe("reducer dig", () => {
  it("finding an egg increments found and score", () => {
    const s = initialState(1, settings);
    const eggIdx = [...s.eggPositions][0]!;
    const s2 = reducer(s, { type: "dig", index: eggIdx });
    expect(s2.found).toBe(1);
    expect(s2.score).toBeGreaterThan(0);
    expect(s2.revealed.has(eggIdx)).toBe(true);
  });

  it("missing increments misses", () => {
    const s = initialState(1, settings);
    const total = ROWS * COLS;
    const missIdx = Array.from({ length: total }, (_, i) => i).find(i => !s.eggPositions.has(i))!;
    const s2 = reducer(s, { type: "dig", index: missIdx });
    expect(s2.misses).toBe(1);
    expect(s2.score).toBe(0);
  });

  it("clicking same cell twice is a no-op", () => {
    const s = initialState(1, settings);
    const idx = [...s.eggPositions][0]!;
    const s2 = reducer(s, { type: "dig", index: idx });
    const s3 = reducer(s2, { type: "dig", index: idx });
    expect(s3.found).toBe(s2.found);
  });

  it("no-op when game is over", () => {
    const s = { ...initialState(1, settings), over: true };
    const s2 = reducer(s, { type: "dig", index: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 200 };
    expect(isTerminal(s)!.score).toBe(200);
  });
});
