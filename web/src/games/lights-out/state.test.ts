import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { LightsOutState } from "./state.js";

const defaultSettings = { size: "5" as const, difficulty: "medium" as const };

describe("LightsOut initialState", () => {
  it("creates a 5x5 grid with some lights on", () => {
    const s = initialState(42, defaultSettings);
    expect(s.size).toBe(5);
    expect(s.lights).toHaveLength(25);
    expect(s.won).toBe(false);
    expect(s.movesMade).toBe(0);
  });

  it("not all lights are off at start (solvable puzzle)", () => {
    const s = initialState(42, defaultSettings);
    const onCount = s.lights.filter(Boolean).length;
    expect(onCount).toBeGreaterThan(0);
  });

  it("4x4 size creates 16 lights", () => {
    const s = initialState(1, { size: "4" as const, difficulty: "easy" as const });
    expect(s.size).toBe(4);
    expect(s.lights).toHaveLength(16);
  });

  it("6x6 size creates 36 lights", () => {
    const s = initialState(1, { size: "6" as const, difficulty: "hard" as const });
    expect(s.size).toBe(6);
    expect(s.lights).toHaveLength(36);
  });
});

describe("LightsOut reducer", () => {
  it("pressing a cell toggles it and its neighbors", () => {
    // Start from all-off and press center (2,2) on 5x5
    const allOff: LightsOutState = {
      settings: defaultSettings,
      size: 5,
      lights: new Array(25).fill(false),
      movesMade: 0,
      won: false,
    };
    const s2 = reducer(allOff, { type: "press", row: 2, col: 2 });
    // center (2,2) and 4 neighbors should be on
    expect(s2.lights[2 * 5 + 2]).toBe(true);  // center
    expect(s2.lights[1 * 5 + 2]).toBe(true);  // top
    expect(s2.lights[3 * 5 + 2]).toBe(true);  // bottom
    expect(s2.lights[2 * 5 + 1]).toBe(true);  // left
    expect(s2.lights[2 * 5 + 3]).toBe(true);  // right
    // corners should be off
    expect(s2.lights[0]).toBe(false);
    expect(s2.movesMade).toBe(1);
  });

  it("pressing a corner only toggles 3 cells", () => {
    const allOff: LightsOutState = {
      settings: defaultSettings,
      size: 5,
      lights: new Array(25).fill(false),
      movesMade: 0,
      won: false,
    };
    const s2 = reducer(allOff, { type: "press", row: 0, col: 0 });
    const onCount = s2.lights.filter(Boolean).length;
    expect(onCount).toBe(3); // (0,0), (0,1), (1,0) — but wait: corner has 2 neighbors => 3 total
    // Actually corner + right + bottom = 3
    expect(onCount).toBe(3);
  });

  it("won when all lights off", () => {
    // Set up a state with exactly 1 light on at (0,0), press it to turn off all (simulate)
    // Since corner press toggles (0,0),(0,1),(1,0), we need those to be on and nothing else
    const lights = new Array(25).fill(false);
    lights[0 * 5 + 0] = true; // (0,0)
    lights[0 * 5 + 1] = true; // (0,1)
    lights[1 * 5 + 0] = true; // (1,0)
    const s: LightsOutState = {
      settings: defaultSettings,
      size: 5,
      lights,
      movesMade: 5,
      won: false,
    };
    const s2 = reducer(s, { type: "press", row: 0, col: 0 });
    expect(s2.won).toBe(true);
    expect(s2.movesMade).toBe(6);
  });
});

describe("LightsOut isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s: LightsOutState = {
      settings: defaultSettings,
      size: 5,
      lights: new Array(25).fill(false),
      movesMade: 10,
      won: true,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 1000 - 10 * 10)); // 900
  });

  it("score floors at 100 for many moves", () => {
    const s: LightsOutState = {
      settings: defaultSettings,
      size: 5,
      lights: new Array(25).fill(false),
      movesMade: 200,
      won: true,
    };
    expect(isTerminal(s)!.score).toBe(100);
  });
});
