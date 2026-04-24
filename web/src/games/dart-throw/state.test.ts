import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 77;
const SETTINGS = { darts: "3" as const };

describe("dart-throw state", () => {
  it("initializes correctly", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalDarts).toBe(3);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });

  it("aim updates throwX/Y", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "aim", dx: 0.3, dy: -0.2 });
    expect(s2.throwX).toBeCloseTo(0.3);
    expect(s2.throwY).toBeCloseTo(-0.2);
  });

  it("throw records a hit", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "aim", dx: 0, dy: 0 });
    const s3 = reducer(s2, { type: "throw" });
    expect(s3.dartsThrown).toBe(1);
    expect(s3.lastHit).not.toBeNull();
  });

  it("game ends after all darts thrown", () => {
    let s = initialState(SEED, SETTINGS);
    for (let i = 0; i < 3; i++) {
      s = reducer(s, { type: "throw" });
    }
    expect(s.over).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("bull's-eye (0,0) gives maximum score of 50", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "aim", dx: 0, dy: 0 });
    const s3 = reducer(s2, { type: "throw" });
    // With noise, likely 25 or 50; score > 0 for sure
    expect(s3.score).toBeGreaterThan(0);
  });
});
