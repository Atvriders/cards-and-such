import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("SlingshotLaunch initialState", () => {
  it("starts in pulling phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("pulling");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("has 3 shots and 3 targets per round", () => {
    const s = initialState();
    expect(s.shotsLeft).toBe(3);
    expect(s.targets.length).toBe(3);
  });

  it("targets are within field bounds", () => {
    const s = initialState();
    for (const t of s.targets) {
      expect(t.x).toBeGreaterThanOrEqual(0.4);
      expect(t.y).toBeGreaterThanOrEqual(0.1);
    }
  });
});

describe("SlingshotLaunch tick pulling", () => {
  it("pull angle oscillates", () => {
    const s = { ...initialState(), pullAngle: 45, pullDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.pullAngle).toBeGreaterThan(45);
  });

  it("pull angle bounces at max", () => {
    const s = { ...initialState(), pullAngle: 79, pullDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.pullDir).toBe(-1);
  });

  it("pull power oscillates", () => {
    const s = { ...initialState(), pullPower: 0.5, powerDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.3 });
    expect(s2.pullPower).toBeGreaterThan(0.5);
  });
});

describe("SlingshotLaunch release", () => {
  it("transitions to flying", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "release" });
    expect(s2.phase).toBe("flying");
    expect(s2.velX).toBeGreaterThan(0);
    expect(s2.velY).toBeLessThan(0); // upward
  });

  it("higher angle means more upward velocity", () => {
    const sLow = { ...initialState(), pullAngle: 15, pullPower: 0.5 };
    const sHigh = { ...initialState(), pullAngle: 70, pullPower: 0.5 };
    const fLow = reducer(sLow, { type: "release" });
    const fHigh = reducer(sHigh, { type: "release" });
    expect(fHigh.velY).toBeLessThan(fLow.velY);
  });
});

describe("SlingshotLaunch isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 375 };
    expect(isTerminal(s)?.score).toBe(375);
  });
});
