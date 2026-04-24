import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 88;
const SETTINGS = { balls: "5" as const };

describe("skee-ball state", () => {
  it("initializes correctly", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalBalls).toBe(5);
    expect(s.ballsThrown).toBe(0);
    expect(s.score).toBe(0);
  });

  it("tick oscillates power", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.launchPower).not.toBe(s.launchPower);
  });

  it("throw starts flight", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.ballInFlight).toBe(true);
  });

  it("tick advances flight", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "throw" });
    const s3 = reducer(s2, { type: "tick", dt: 0.1 });
    expect(s3.ballT).toBeGreaterThan(s2.ballT);
  });

  it("ball lands and scores after flight completes", () => {
    let s = initialState(SEED, SETTINGS);
    s = reducer(s, { type: "throw" });
    // Advance until landed
    for (let i = 0; i < 60; i++) {
      if (!s.ballInFlight) break;
      s = reducer(s, { type: "tick", dt: 0.05 });
    }
    expect(s.ballInFlight).toBe(false);
    expect(s.lastScore).not.toBeNull();
  });
});
