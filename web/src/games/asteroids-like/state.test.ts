import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AsteroidsState } from "./state.js";

const defaultSettings = { startingAsteroids: "5" as const };

describe("initialState", () => {
  it("ship starts at center, has 3 lives, game not over", () => {
    const s = initialState(42, defaultSettings);
    expect(s.ship.x).toBeCloseTo(0.5);
    expect(s.ship.y).toBeCloseTo(0.5);
    expect(s.lives).toBe(3);
    expect(s.over).toBe(false);
    expect(s.won).toBe(false);
  });

  it("creates the correct number of asteroids", () => {
    const s5 = initialState(1, { startingAsteroids: "5" as const });
    expect(s5.asteroids.length).toBe(5);
    const s12 = initialState(1, { startingAsteroids: "12" as const });
    expect(s12.asteroids.length).toBe(12);
  });
});

describe("rotate action", () => {
  it("rotate left decreases ship angle on tick", () => {
    const s = initialState(0, defaultSettings);
    const s1 = reducer(s, { type: "rotate", dir: "left" });
    const s2 = reducer(s1, { type: "tick", dt: 0.1 });
    expect(s2.ship.angle).toBeLessThan(s.ship.angle);
  });

  it("rotate right increases ship angle on tick", () => {
    const s = initialState(0, defaultSettings);
    const s1 = reducer(s, { type: "rotate", dir: "right" });
    const s2 = reducer(s1, { type: "tick", dt: 0.1 });
    expect(s2.ship.angle).toBeGreaterThan(s.ship.angle);
  });
});

describe("thrust action", () => {
  it("thrusting accelerates ship in facing direction", () => {
    const s = initialState(0, defaultSettings);
    // Ship faces angle -π/2 (up, meaning negative y)
    const s1 = reducer(s, { type: "thrust", on: true });
    const s2 = reducer(s1, { type: "tick", dt: 0.5 });
    // Ship should have moved from 0.5
    const moved = Math.abs(s2.ship.x - 0.5) > 0.001 || Math.abs(s2.ship.y - 0.5) > 0.001;
    expect(moved).toBe(true);
  });
});

describe("fire action", () => {
  it("fire creates a bullet", () => {
    const s = initialState(0, defaultSettings);
    const after = reducer(s, { type: "fire" });
    expect(after.bullets.length).toBe(1);
  });

  it("bullet decays over time (ttl decreases)", () => {
    const s = initialState(0, defaultSettings);
    const fired = reducer(s, { type: "fire" });
    const ticked = reducer(fired, { type: "tick", dt: 0.016 });
    expect(ticked.bullets[0]!.ttl).toBeLessThan(fired.bullets[0]!.ttl);
  });
});

describe("tick - position wraps", () => {
  it("ship wraps around screen edges", () => {
    const s = initialState(0, defaultSettings);
    // Place ship near right edge moving right
    const atEdge: AsteroidsState = {
      ...s,
      ship: { ...s.ship, x: 0.999, y: 0.5, vx: 0.5, vy: 0 },
      invincible: 999,
    };
    const after = reducer(atEdge, { type: "tick", dt: 0.1 });
    expect(after.ship.x).toBeLessThan(0.2); // wrapped
  });
});

describe("asteroid hit", () => {
  it("bullet hitting large asteroid splits it and scores", () => {
    const s = initialState(0, defaultSettings);
    // Place one large asteroid at a known position
    const asteroid = { id: 100, x: 0.5, y: 0.3, vx: 0, vy: 0, size: 3 };
    const bullet = { id: 200, x: 0.5, y: 0.3, vx: 0, vy: 0, ttl: 10 };
    const state: AsteroidsState = {
      ...s,
      asteroids: [asteroid],
      bullets: [bullet],
    };
    const after = reducer(state, { type: "tick", dt: 0.016 });
    // Original asteroid gone, 2 smaller ones spawned
    expect(after.asteroids.length).toBe(2);
    expect(after.score).toBeGreaterThan(0);
  });
});

describe("ship collision", () => {
  it("ship loses a life when hitting asteroid while not invincible", () => {
    const s = initialState(0, defaultSettings);
    const asteroid = { id: 100, x: 0.5, y: 0.5, vx: 0, vy: 0, size: 3 };
    const state: AsteroidsState = {
      ...s,
      asteroids: [asteroid],
      bullets: [],
      invincible: 0,
      ship: { ...s.ship, x: 0.5, y: 0.5, vx: 0, vy: 0 },
    };
    const after = reducer(state, { type: "tick", dt: 0.016 });
    expect(after.lives).toBeLessThan(3);
  });
});

describe("isTerminal", () => {
  it("returns null when game is running", () => {
    const s = initialState(0, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns 0 score when over (lives = 0)", () => {
    const s = initialState(0, defaultSettings);
    const dead: AsteroidsState = { ...s, over: true, lives: 0, score: 150 };
    const t = isTerminal(dead);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(150);
  });

  it("returns score + lives bonus when won", () => {
    const s = initialState(0, defaultSettings);
    const won: AsteroidsState = { ...s, won: true, lives: 2, score: 500 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBe(500 + 2 * 200);
  });
});
