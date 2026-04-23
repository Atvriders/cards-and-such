import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { RingThrowerState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("starts in pickAngle phase with 10 throws", () => {
    const s = initialState(42, settings);
    expect(s.phase).toBe("pickAngle");
    expect(s.throwsLeft).toBe(10);
    expect(s.over).toBe(false);
  });

  it("pegs are generated", () => {
    const s = initialState(42, settings);
    expect(s.pegs.length).toBeGreaterThan(0);
    expect(s.score).toBe(0);
  });
});

describe("tap in pickAngle", () => {
  it("moves to pickPower phase", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tap" });
    expect(after.phase).toBe("pickPower");
  });
});

describe("tap in pickPower", () => {
  it("launches ring and decrements throwsLeft", () => {
    const s: RingThrowerState = { ...initialState(42, settings), phase: "pickPower", power: 0.5 };
    const after = reducer(s, { type: "tap" });
    expect(after.phase).toBe("throwing");
    expect(after.throwsLeft).toBe(9);
    expect(after.ring).not.toBeNull();
  });
});

describe("tick - angle oscillation", () => {
  it("angle changes on tick during pickAngle", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.angle).not.toBe(s.angle);
  });

  it("power changes on tick during pickPower", () => {
    const s: RingThrowerState = { ...initialState(42, settings), phase: "pickPower", power: 0.01, powerDir: 1 };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.power).toBeGreaterThan(s.power);
  });
});

describe("ring hit detection", () => {
  it("scores points when ring lands on peg", () => {
    const pegX = 0.5, pegY = 0.5;
    const s: RingThrowerState = {
      ...initialState(42, settings),
      phase: "throwing",
      ring: { x: pegX - 0.01, y: pegY - 0.01, vx: 0.1, vy: 0 },
      pegs: [{ id: 1, x: pegX, y: pegY, points: 5, radius: 0.05 }],
    };
    // Tick until ring reaches peg
    let ns = s;
    for (let i = 0; i < 5; i++) ns = reducer(ns, { type: "tick", dt: 0.05 });
    expect(ns.score).toBeGreaterThan(0);
  });
});

describe("result → next throw", () => {
  it("advances to pickAngle on tap during result with throws remaining", () => {
    const s: RingThrowerState = { ...initialState(42, settings), phase: "result", throwsLeft: 5 };
    const after = reducer(s, { type: "tap" });
    expect(after.phase).toBe("pickAngle");
  });

  it("sets done and over when no throws remain on tap during result", () => {
    const s: RingThrowerState = { ...initialState(42, settings), phase: "result", throwsLeft: 0 };
    const after = reducer(s, { type: "tap" });
    expect(after.over).toBe(true);
    expect(after.phase).toBe("done");
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 37 };
    expect(isTerminal(s)!.score).toBe(37);
  });
});
