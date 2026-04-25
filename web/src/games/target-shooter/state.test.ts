import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("TargetShooter initialState", () => {
  it("starts in aiming phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("aiming");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("target is within bounds", () => {
    const s = initialState();
    expect(s.target.x).toBeGreaterThanOrEqual(0.15);
    expect(s.target.x).toBeLessThanOrEqual(0.85);
  });
});

describe("TargetShooter tick", () => {
  it("crosshair position changes on tick", () => {
    const s = initialState();
    const x0 = s.crosshairX;
    const s2 = reducer(s, { type: "tick", dt: 0.5 });
    // After half second crosshair should have moved
    expect(s2.crosshairX !== x0 || s2.elapsed > 0).toBe(true);
  });

  it("elapsed time increases", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.elapsed).toBeCloseTo(0.2);
  });
});

describe("TargetShooter fire", () => {
  it("transitions from aiming to shot or gameover", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "fire" });
    expect(["shot", "gameover"]).toContain(s2.phase);
  });

  it("hit on target earns points", () => {
    // Place crosshair exactly on target
    const s = initialState();
    const aligned = { ...s, crosshairX: s.target.x, crosshairY: s.target.y };
    const s2 = reducer(aligned, { type: "fire" });
    expect(s2.lastPoints).toBeGreaterThan(0);
    expect(s2.score).toBeGreaterThan(0);
  });

  it("miss earns 0 points", () => {
    const s = initialState();
    const missed = { ...s, crosshairX: 0, crosshairY: 0 };
    const s2 = reducer(missed, { type: "fire" });
    expect(s2.lastPoints).toBe(0);
  });

  it("records shot position", () => {
    const s = { ...initialState(), crosshairX: 0.7, crosshairY: 0.3 };
    const s2 = reducer(s, { type: "fire" });
    expect(s2.shotX).toBeCloseTo(0.7);
    expect(s2.shotY).toBeCloseTo(0.3);
  });
});

describe("TargetShooter isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 450 };
    expect(isTerminal(s)?.score).toBe(450);
  });
});
