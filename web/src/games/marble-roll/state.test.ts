import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("MarbleRoll initialState", () => {
  it("starts in rolling phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("rolling");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("marble starts near top center", () => {
    const s = initialState();
    expect(s.marbleX).toBeCloseTo(0.5);
    expect(s.marbleY).toBeLessThan(0.3);
  });

  it("hole is within valid bounds", () => {
    const s = initialState();
    expect(s.holeX).toBeGreaterThanOrEqual(0.2);
    expect(s.holeX).toBeLessThanOrEqual(0.8);
  });
});

describe("MarbleRoll tick", () => {
  it("marble moves on tick", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.marbleY).toBeGreaterThan(s.marbleY);
  });

  it("tilt right increases horizontal velocity", () => {
    const s = { ...initialState(), tiltRight: true, velX: 0 };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.velX).toBeGreaterThan(0);
  });

  it("tilt left decreases horizontal velocity", () => {
    const s = { ...initialState(), tiltLeft: true, velX: 0 };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.velX).toBeLessThan(0);
  });

  it("marble bounces off right wall", () => {
    const s = { ...initialState(), marbleX: 0.97, velX: 0.5 };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.marbleX).toBeLessThanOrEqual(0.98);
  });
});

describe("MarbleRoll tilt action", () => {
  it("sets tiltLeft flag", () => {
    const s = reducer(initialState(), { type: "tilt", dir: "left" });
    expect(s.tiltLeft).toBe(true);
    expect(s.tiltRight).toBe(false);
  });

  it("clears tilt on none", () => {
    const s = { ...initialState(), tiltLeft: true };
    const s2 = reducer(s, { type: "tilt", dir: "none" });
    expect(s2.tiltLeft).toBe(false);
    expect(s2.tiltRight).toBe(false);
  });
});

describe("MarbleRoll isTerminal", () => {
  it("returns null while rolling", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 200 };
    expect(isTerminal(s)?.score).toBe(200);
  });
});
