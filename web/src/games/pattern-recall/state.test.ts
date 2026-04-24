import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, GRID_SIZE } from "./state.js";

const med = { difficulty: "medium" as const };
const easy = { difficulty: "easy" as const };

describe("PatternRecall initialState", () => {
  it("starts idle", () => {
    const s = initialState(42, med);
    expect(s.phase).toBe("idle");
    expect(s.pattern.length).toBe(0);
    expect(s.round).toBe(0);
  });

  it("is deterministic", () => {
    expect(initialState(7, med).rngSeed).toBe(initialState(7, med).rngSeed);
  });
});

describe("PatternRecall start", () => {
  it("enters showing with correct pattern size for easy", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "start" });
    expect(s2.phase).toBe("showing");
    expect(s2.pattern.length).toBe(4);
    expect(s2.round).toBe(1);
  });

  it("pattern cells are within grid bounds", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    for (const cell of s.pattern) {
      expect(cell).toBeGreaterThanOrEqual(0);
      expect(cell).toBeLessThan(GRID_SIZE);
    }
  });

  it("pattern cells are unique", () => {
    const s = reducer(initialState(42, med), { type: "start" });
    const unique = new Set(s.pattern);
    expect(unique.size).toBe(s.pattern.length);
  });

  it("same seed same pattern", () => {
    const pat = (seed: number) => reducer(initialState(seed, easy), { type: "start" }).pattern;
    expect(pat(10)).toEqual(pat(10));
  });
});

describe("PatternRecall reveal and toggle", () => {
  it("reveal transitions to input", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    expect(s.phase).toBe("input");
    expect(s.playerPattern.length).toBe(0);
  });

  it("toggle-cell adds cell", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "toggle-cell", cell: 3 });
    expect(s.playerPattern).toContain(3);
  });

  it("toggle-cell removes cell if already selected", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "toggle-cell", cell: 3 });
    s = reducer(s, { type: "toggle-cell", cell: 3 });
    expect(s.playerPattern).not.toContain(3);
  });

  it("toggle is no-op outside input phase", () => {
    const s = initialState(42, easy);
    const s2 = reducer(s, { type: "toggle-cell", cell: 3 });
    expect(s2.playerPattern.length).toBe(0);
  });
});

describe("PatternRecall submit", () => {
  it("perfect recall gives full accuracy", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const pattern = [...s.pattern];
    s = reducer(s, { type: "reveal" });
    for (const cell of pattern) {
      s = reducer(s, { type: "toggle-cell", cell });
    }
    s = reducer(s, { type: "submit" });
    expect(s.phase).toBe("result");
    expect(s.lastAccuracy).toBe(1);
  });

  it("no clicks gives 0 accuracy", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    s = reducer(s, { type: "reveal" });
    s = reducer(s, { type: "submit" });
    expect(s.lastAccuracy).toBe(0);
  });

  it("score increases with correct recall", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const pattern = [...s.pattern];
    s = reducer(s, { type: "reveal" });
    for (const cell of pattern) s = reducer(s, { type: "toggle-cell", cell });
    const before = s.score;
    s = reducer(s, { type: "submit" });
    expect(s.score).toBeGreaterThan(before);
  });

  it("partial credit with some correct cells", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    const pattern = [...s.pattern];
    s = reducer(s, { type: "reveal" });
    // Click only first cell
    s = reducer(s, { type: "toggle-cell", cell: pattern[0]! });
    s = reducer(s, { type: "submit" });
    expect(s.lastAccuracy).toBeGreaterThan(0);
    expect(s.lastAccuracy).toBeLessThan(1);
  });
});

describe("PatternRecall progression", () => {
  it("game ends after 8 rounds", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    for (let round = 0; round < 8; round++) {
      s = reducer(s, { type: "reveal" });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });

  it("isTerminal returns score when done", () => {
    let s = reducer(initialState(42, easy), { type: "start" });
    for (let round = 0; round < 8; round++) {
      s = reducer(s, { type: "reveal" });
      s = reducer(s, { type: "submit" });
      s = reducer(s, { type: "next" });
    }
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(0);
  });

  it("isTerminal returns null when not done", () => {
    expect(isTerminal(initialState(42, med))).toBeNull();
  });
});
