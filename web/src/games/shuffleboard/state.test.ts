import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s3 = { rounds: "3" as const };
const s5 = { rounds: "5" as const };

describe("initialState", () => {
  it("starts at round 1 with no discs", () => {
    const s = initialState(1, s5);
    expect(s.currentRound).toBe(1);
    expect(s.currentDiscs.length).toBe(0);
    expect(s.phase).toBe("aim");
  });

  it("totalRounds matches setting", () => {
    expect(initialState(1, s3).totalRounds).toBe(3);
    expect(initialState(1, s5).totalRounds).toBe(5);
  });

  it("is deterministic", () => {
    const a = initialState(42, s5);
    const b = initialState(42, s5);
    expect(a.rngSeed).toBe(b.rngSeed);
  });
});

describe("reducer — aim", () => {
  it("set-angle updates angle", () => {
    const s = initialState(1, s5);
    expect(reducer(s, { type: "set-angle", value: 0.3 }).angle).toBeCloseTo(0.3);
  });

  it("set-power clamps", () => {
    const s = initialState(1, s5);
    expect(reducer(s, { type: "set-power", value: -0.1 }).power).toBe(0);
  });
});

describe("reducer — sliding", () => {
  it("slide adds 2 discs per pair (player + bot)", () => {
    const s = initialState(1, s5);
    const s2 = reducer(s, { type: "slide" });
    // After sliding, 2 discs should exist
    expect(s2.currentDiscs.length).toBe(2);
  });

  it("after 4 slides a round completes", () => {
    let s = initialState(1, s3);
    for (let i = 0; i < 4; i++) {
      s = reducer(s, { type: "slide" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(["round-over", "done"]).toContain(s.phase);
  });

  it("game ends after all rounds", () => {
    let s = initialState(2, s3);
    let iters = 0;
    while (s.phase !== "done" && iters < 100) {
      if (s.phase === "aim") s = reducer(s, { type: "slide" });
      else s = reducer(s, { type: "next" });
      iters++;
    }
    expect(s.phase).toBe("done");
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s5))).toBeNull();
  });

  it("returns score after done", () => {
    const done = { ...initialState(1, s5), phase: "done" as const, playerTotalScore: 5, botTotalScore: 3 };
    const t = isTerminal(done);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});
