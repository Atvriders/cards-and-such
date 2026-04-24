import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 42;
const SETTINGS = { rounds: "5" as const };

describe("cannon-shot state", () => {
  it("initializes with correct round count", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalRounds).toBe(5);
    expect(s.round).toBe(1);
    expect(s.score).toBe(0);
  });

  it("fire creates a projectile", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "fire" });
    expect(s2.projectile).not.toBeNull();
    expect(s2.projectile?.active).toBe(true);
  });

  it("setAngle clamps to [0,90]", () => {
    const s = initialState(SEED, SETTINGS);
    const s1 = reducer(s, { type: "setAngle", angle: -10 });
    expect(s1.angle).toBe(0);
    const s2 = reducer(s, { type: "setAngle", angle: 200 });
    expect(s2.angle).toBe(90);
  });

  it("tick advances projectile position", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "fire" });
    const s3 = reducer(s2, { type: "tick", dt: 0.016 });
    expect(s3.projectile?.x).toBeGreaterThan(s2.projectile!.x);
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
