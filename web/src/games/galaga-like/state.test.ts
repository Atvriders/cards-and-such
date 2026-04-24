import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ENEMY_ROWS, ENEMY_COLS } from "./state.js";
import type { GalaxyFormationState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("starts with correct enemy count, lives, and score", () => {
    const s = initialState(42);
    expect(s.enemies.length).toBe(ENEMY_ROWS * ENEMY_COLS);
    expect(s.enemies.every((e) => e.alive)).toBe(true);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.playerX).toBe(0.5);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed produces same state", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

// ─── 3. Fire action ──────────────────────────────────────────────────────────
describe("fire", () => {
  it("adds a player bullet moving upward", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "fire" });
    const playerBullets = after.bullets.filter((b) => !b.isEnemy);
    expect(playerBullets.length).toBe(1);
    expect(playerBullets[0]!.vy).toBeLessThan(0);
  });

  it("caps at 2 simultaneous player bullets", () => {
    let s = initialState(42);
    s = reducer(s, { type: "fire" });
    s = reducer(s, { type: "fire" });
    s = reducer(s, { type: "fire" }); // 3rd should be ignored
    const playerBullets = s.bullets.filter((b) => !b.isEnemy);
    expect(playerBullets.length).toBeLessThanOrEqual(2);
  });
});

// ─── 4. Move action ───────────────────────────────────────────────────────────
describe("move", () => {
  it("clamps player position within bounds", () => {
    const s = initialState(42);
    const left = reducer(s, { type: "move", x: -1 });
    expect(left.playerX).toBeGreaterThan(0);
    const right = reducer(s, { type: "move", x: 2 });
    expect(right.playerX).toBeLessThan(1);
  });
});

// ─── 5. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when lost", () => {
    const s: GalaxyFormationState = { ...initialState(42), lost: true, score: 300 };
    expect(isTerminal(s)?.score).toBe(300);
  });

  it("returns score + lives bonus when won", () => {
    const s: GalaxyFormationState = { ...initialState(42), won: true, score: 1000, lives: 2 };
    const result = isTerminal(s);
    expect(result?.score).toBe(1000 + 2 * 500);
  });
});

// ─── 6. Pause/resume ─────────────────────────────────────────────────────────
describe("pause/resume", () => {
  it("pause sets paused=true, resume sets paused=false", () => {
    const s = initialState(42);
    const paused = reducer(s, { type: "pause" });
    expect(paused.paused).toBe(true);
    const resumed = reducer(paused, { type: "resume" });
    expect(resumed.paused).toBe(false);
  });
});
