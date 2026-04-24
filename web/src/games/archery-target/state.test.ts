import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const SEED = 99;
const SETTINGS = { arrows: "5" as const };

describe("archery-target state", () => {
  it("initializes with correct arrow count", () => {
    const s = initialState(SEED, SETTINGS);
    expect(s.totalArrows).toBe(5);
    expect(s.arrowsShot).toBe(0);
    expect(s.score).toBe(0);
  });

  it("tick increases draw power", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "startDraw" });
    const s3 = reducer(s2, { type: "tick", dt: 0.5 });
    expect(s3.drawPower).toBeGreaterThan(0);
  });

  it("release increments arrowsShot", () => {
    const s = initialState(SEED, SETTINGS);
    const s2 = reducer(s, { type: "tick", dt: 0.3 });
    const s3 = reducer(s2, { type: "release" });
    expect(s3.arrowsShot).toBe(1);
    expect(s3.lastScore).not.toBeNull();
  });

  it("game ends after all arrows shot", () => {
    let s = initialState(SEED, SETTINGS);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "tick", dt: 0.3 });
      s = reducer(s, { type: "release" });
    }
    expect(s.over).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null mid-game", () => {
    const s = initialState(SEED, SETTINGS);
    expect(isTerminal(s)).toBeNull();
  });
});
