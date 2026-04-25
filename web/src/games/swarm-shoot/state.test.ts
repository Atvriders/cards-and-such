import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SwarmShootState } from "./state.js";

const def = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts with 3 lives, enemies spawned, score 0", () => {
    const s = initialState(1, def);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.enemies.length).toBeGreaterThan(0);
    expect(s.over).toBe(false);
    expect(s.wave).toBe(1);
  });
});

describe("determinism", () => {
  it("same seed gives same state", () => {
    expect(initialState(13, def)).toEqual(initialState(13, def));
  });
});

describe("move action", () => {
  it("clamped player movement", () => {
    const s = initialState(1, def);
    const moved = reducer(s, { type: "move", x: 0.3 });
    expect(moved.playerX).toBeCloseTo(0.3);
    const clamped = reducer(s, { type: "move", x: 5 });
    expect(clamped.playerX).toBe(0.98);
  });
});

describe("shoot action", () => {
  it("creates a bullet when cooldown is 0", () => {
    const s = { ...initialState(1, def), shootCooldown: 0 };
    const after = reducer(s, { type: "shoot" });
    expect(after.bullets.length).toBe(1);
    expect(after.shootCooldown).toBeGreaterThan(0);
  });
  it("does not fire when cooldown > 0", () => {
    const s = { ...initialState(1, def), shootCooldown: 0.2 };
    const after = reducer(s, { type: "shoot" });
    expect(after.bullets.length).toBe(0);
  });
});

describe("enemy reaches bottom — lose life", () => {
  it("lives decrease when enemy passes bottom edge", () => {
    const base = initialState(1, def);
    const withEnemy: SwarmShootState = {
      ...base,
      enemies: [{ id: 999, x: 0.5, y: 0.99, vx: 0, vy: 0.2, radius: 0.04, hp: 1 }],
    };
    const after = reducer(withEnemy, { type: "tick", dt: 0.05 });
    expect(after.lives).toBe(2);
  });
});

describe("isTerminal", () => {
  it("null when alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 150 };
    expect(isTerminal(s)).toEqual({ score: 150 });
  });
});
