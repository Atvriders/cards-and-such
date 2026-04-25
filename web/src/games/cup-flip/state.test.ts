import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, nextRound } from "./state.js";

describe("CupFlip initialState", () => {
  it("starts in sliding phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("sliding");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("ball is under one of the three cups", () => {
    const s = initialState();
    expect([0, 1, 2]).toContain(s.ballUnder);
  });

  it("cup positions start as [0,1,2]", () => {
    const s = initialState();
    expect(s.cupPositions).toEqual([0, 1, 2]);
  });
});

describe("CupFlip tick", () => {
  it("shuffleT increases on tick", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.shuffleT).toBeGreaterThan(0);
  });

  it("swaps cups when shuffleT reaches 1", () => {
    const s = { ...initialState(), shuffleT: 0.95, swapA: 0, swapB: 1 };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    // Either cup positions changed or phase changed
    const posChanged = s2.cupPositions[0] !== s.cupPositions[0] || s2.cupPositions[1] !== s.cupPositions[1];
    const phaseChanged = s2.shuffleStep > s.shuffleStep;
    expect(posChanged || phaseChanged).toBe(true);
  });
});

describe("CupFlip choose", () => {
  it("correct guess earns points", () => {
    const s = { ...initialState(), phase: "flipped" as const, ballUnder: 1 };
    const s2 = reducer(s, { type: "choose", cup: 1 });
    expect(s2.correct).toBe(true);
    expect(s2.lastPts).toBeGreaterThan(0);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("wrong guess earns no points", () => {
    const s = { ...initialState(), phase: "flipped" as const, ballUnder: 1 };
    const s2 = reducer(s, { type: "choose", cup: 0 });
    expect(s2.correct).toBe(false);
    expect(s2.lastPts).toBe(0);
  });
});

describe("CupFlip nextRound", () => {
  it("advances round number and keeps score", () => {
    const s = { ...initialState(), score: 50, revealed: true };
    const s2 = nextRound(s);
    expect(s2.round).toBe(2);
    expect(s2.score).toBe(50);
  });

  it("resets to sliding phase", () => {
    const s = nextRound({ ...initialState(), score: 30, revealed: true });
    expect(s.phase).toBe("sliding");
  });
});

describe("CupFlip isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 100 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
