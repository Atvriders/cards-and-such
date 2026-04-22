import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

const settings = { rounds: "10" as const, difficulty: "easy" as const };

describe("OddOneOut initialState", () => {
  it("starts at round 1", () => {
    const s = initialState(1, settings);
    expect(s.roundNumber).toBe(1);
    expect(s.totalRounds).toBe(10);
  });

  it("current puzzle has 4 items", () => {
    const s = initialState(1, settings);
    expect(s.currentPuzzle.items.length).toBe(4);
  });

  it("oddIndex is in range 0-3", () => {
    const s = initialState(1, settings);
    expect(s.currentPuzzle.oddIndex).toBeGreaterThanOrEqual(0);
    expect(s.currentPuzzle.oddIndex).toBeLessThanOrEqual(3);
  });

  it("phase starts as playing", () => {
    const s = initialState(1, settings);
    expect(s.phase).toBe("playing");
  });
});

describe("OddOneOut PUZZLES", () => {
  it("has at least 35 puzzles total", () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(35);
  });

  it("all puzzles have valid oddIndex", () => {
    for (const p of PUZZLES) {
      expect(p.oddIndex).toBeGreaterThanOrEqual(0);
      expect(p.oddIndex).toBeLessThanOrEqual(3);
      expect(p.items.length).toBe(4);
    }
  });
});

describe("OddOneOut reducer", () => {
  it("select correct index increments correct", () => {
    const s = initialState(1, settings);
    const oddIdx = s.currentPuzzle.oddIndex;
    const s2 = reducer(s, { type: "select", index: oddIdx });
    expect(s2.correct).toBe(1);
    expect(s2.isRevealed).toBe(true);
    expect(s2.streak).toBe(1);
  });

  it("select wrong index increments wrong", () => {
    const s = initialState(1, settings);
    const wrongIdx = (s.currentPuzzle.oddIndex + 1) % 4;
    const s2 = reducer(s, { type: "select", index: wrongIdx });
    expect(s2.wrong).toBe(1);
    expect(s2.streak).toBe(0);
  });

  it("cannot select again after revealed", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "select", index: 1 });
    expect(s3.selectedIndex).toBe(s2.selectedIndex);
  });

  it("next advances round", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", index: 0 });
    const s3 = reducer(s2, { type: "next" });
    expect(s3.roundNumber).toBe(2);
    expect(s3.isRevealed).toBe(false);
  });

  it("next on last round sets done", () => {
    const s = initialState(1, settings);
    const atLast = { ...s, roundNumber: 10, isRevealed: true };
    const s2 = reducer(atLast, { type: "next" });
    expect(s2.phase).toBe("done");
  });
});

describe("OddOneOut isTerminal", () => {
  it("returns null while playing", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 5 points per correct", () => {
    const s = initialState(1, settings);
    const done = { ...s, phase: "done" as const, correct: 8 };
    expect(isTerminal(done)).toEqual({ score: 40 });
  });
});
