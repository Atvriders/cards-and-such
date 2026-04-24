import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 11;
const SETTINGS = { swings: "5" as const };

describe("pendulum-drop state", () => {
  it("initializes with correct swing count", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalSwings).toBe(5);
    expect(s.swingsUsed).toBe(0);
    expect(s.score).toBe(0);
  });

  it("tick swings pendulum angle", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "tick", dt: 0.05 });
    // Angle should change (pendulum moves)
    expect(s2.angle).not.toBe(s.angle);
  });

  it("release sets released flag", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "release" });
    expect(s2.released).toBe(true);
  });

  it("tick after release moves ball", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "release" });
    const s3 = reducer(s2, { type: "tick", dt: 0.05 });
    expect(s3.ballY).toBeGreaterThan(s2.ballY);
  });

  it("isTerminal null mid-game", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
