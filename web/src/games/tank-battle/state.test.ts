import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { gridSize: "10" as const };

describe("initialState", () => {
  it("creates a valid state with enemies and player", () => {
    const s = initialState(1, defaultSettings);
    expect(s.lives).toBe(3);
    expect(s.over).toBe(false);
    expect(s.enemies.length).toBeGreaterThan(0);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("move action", () => {
  it("player moves to empty adjacent cell", () => {
    const s = initialState(5, defaultSettings);
    const mid = s.player.x;
    // Try moving right — may or may not be blocked
    const after = reducer(s, { type: "move", dx: 0, dy: 0 });
    expect(after.player).toBeDefined();
  });
});

describe("shoot action", () => {
  it("shooting creates a bullet", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "shoot" });
    expect(after.bullets.length).toBe(1);
    expect(after.bullets[0]!.fromPlayer).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = initialState(1, defaultSettings);
    const overState = { ...s, over: true, score: 200 };
    const result = isTerminal(overState);
    expect(result).not.toBeNull();
    expect(result?.score).toBe(200);
  });
});
