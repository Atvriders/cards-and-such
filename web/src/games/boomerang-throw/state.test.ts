import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BoomerangThrow initialState", () => {
  it("starts in charging phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("charging");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("charge starts at 0", () => {
    expect(initialState().charge).toBe(0);
  });
});

describe("BoomerangThrow charging", () => {
  it("charge increases on tick", () => {
    const s = { ...initialState(), charge: 0, chargeDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.charge).toBeGreaterThan(0);
  });

  it("charge bounces at max", () => {
    const s = { ...initialState(), charge: 0.99, chargeDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.chargeDir).toBe(-1);
  });

  it("act transitions to flying", () => {
    const s = { ...initialState(), charge: 0.5 };
    const s2 = reducer(s, { type: "act" });
    expect(s2.phase).toBe("flying");
  });
});

describe("BoomerangThrow flying", () => {
  it("boomerang moves during flying tick", () => {
    const s = reducer(initialState(), { type: "act" });
    expect(s.phase).toBe("flying");
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.t).toBeGreaterThan(0);
  });

  it("transitions to returning after t >= 1", () => {
    const s = { ...reducer(initialState(), { type: "act" }), t: 0.95 };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.phase).toBe("returning");
  });
});

describe("BoomerangThrow isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 80 };
    expect(isTerminal(s)?.score).toBe(80);
  });
});
