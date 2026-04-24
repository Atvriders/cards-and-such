import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 55;
const SETTINGS = { rounds: "5" as const };

describe("axe-throw state", () => {
  it("initializes correctly", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalRounds).toBe(5);
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
    expect(s.throwing).toBe(false);
  });

  it("tick advances swing phase", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.swingPhase).toBeGreaterThan(s.swingPhase);
  });

  it("throw launches axe", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "throw" });
    expect(s2.throwing).toBe(true);
    expect(s2.axeVx).toBeGreaterThan(0);
  });

  it("tick advances axe in flight", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "throw" });
    const s3 = reducer(s2, { type: "tick", dt: 0.1 });
    expect(s3.axeX).toBeGreaterThan(s2.axeX);
  });

  it("isTerminal null before all rounds done", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
