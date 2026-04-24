import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 22;
const SETTINGS = { boulders: "5" as const };

describe("catapult-castle state", () => {
  it("initializes with blocks and correct boulder count", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalBoulders).toBe(5);
    expect(s.blocks.length).toBeGreaterThan(0);
    expect(s.blocks.every(b => !b.destroyed)).toBe(true);
  });

  it("launch creates a boulder", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "launch" });
    expect(s2.boulder).not.toBeNull();
    expect(s2.bouldersUsed).toBe(1);
  });

  it("tick advances boulder position", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "launch" });
    const s3 = reducer(s2, { type: "tick", dt: 0.05 });
    expect(s3.boulder?.x).toBeGreaterThan(s2.boulder!.x);
  });

  it("setAngle clamps to [10,75]", () => {
    const s = initialState(SEED, SETTINGS);
    const s1 = reducer(s, { type: "setAngle", angle: 0 });
    expect(s1.angle).toBe(10);
    const s2 = reducer(s, { type: "setAngle", angle: 90 });
    expect(s2.angle).toBe(75);
  });

  it("isTerminal null mid-game", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
