import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PLATFORMS, PLAYER_R } from "./state.js";
import type { SkyJoustState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("starts on floor with 3 lives, enemies present", () => {
    const s = initialState(42);
    expect(s.playerY).toBeCloseTo(PLATFORMS[0]!.y - PLAYER_R, 4);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.enemies.length).toBeGreaterThan(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed same state", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

// ─── 3. Flap sets vy negative ────────────────────────────────────────────────
describe("flap", () => {
  it("sets playerVy negative", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "flap" });
    expect(after.playerVy).toBeLessThan(0);
  });
});

// ─── 4. Move directions set vx ───────────────────────────────────────────────
describe("move", () => {
  it("move-left sets vx negative", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "move-left" }).playerVx).toBeLessThan(0);
  });
  it("move-right sets vx positive", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "move-right" }).playerVx).toBeGreaterThan(0);
  });
});

// ─── 5. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null while in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: SkyJoustState = { ...initialState(42), lost: true, score: 500 };
    expect(isTerminal(s)?.score).toBe(500);
  });

  it("score + lives bonus on won", () => {
    const s: SkyJoustState = { ...initialState(42), won: true, score: 1000, lives: 2 };
    expect(isTerminal(s)?.score).toBe(2000);
  });
});

// ─── 6. Pause/resume ─────────────────────────────────────────────────────────
describe("pause/resume", () => {
  it("works correctly", () => {
    const s = initialState(42);
    const p = reducer(s, { type: "pause" });
    expect(p.paused).toBe(true);
    expect(reducer(p, { type: "resume" }).paused).toBe(false);
  });
});
