import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s4 = { ends: "4" as const };

describe("initialState", () => {
  it("starts at 0 score", () => {
    const s = initialState(1, s4);
    expect(s.totalScore).toBe(0);
    expect(s.endIndex).toBe(0);
    expect(s.stoneIndex).toBe(0);
  });

  it("starts in aim phase", () => {
    expect(initialState(1, s4).phase).toBe("aim");
  });

  it("is deterministic", () => {
    const a = initialState(77, s4);
    const b = initialState(77, s4);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer", () => {
  it("throw records stone", () => {
    const s = initialState(1, s4);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.stones.length).toBe(1);
  });

  it("weight clamped to 0..1", () => {
    const s = initialState(1, s4);
    expect(reducer(s, { type: "set-weight", value: 2 }).weight).toBe(1);
    expect(reducer(s, { type: "set-weight", value: -1 }).weight).toBe(0);
  });

  it("completes after all ends", () => {
    let s = initialState(5, s4);
    let iters = 0;
    while (s.phase !== "done" && iters < 100) {
      if (s.phase === "aim") s = reducer(s, { type: "throw" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
  });

  it("no-op when done", () => {
    const done = { ...initialState(1, s4), phase: "done" as const };
    expect(reducer(done, { type: "throw" })).toBe(done);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s4))).toBeNull();
  });

  it("score = totalScore * 25", () => {
    const done = { ...initialState(1, s4), phase: "done" as const, totalScore: 20 };
    expect(isTerminal(done)!.score).toBe(500);
  });

  it("0 score when no points", () => {
    const done = { ...initialState(1, s4), phase: "done" as const, totalScore: 0 };
    expect(isTerminal(done)!.score).toBe(0);
  });
});
