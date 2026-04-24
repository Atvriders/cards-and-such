import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PLATFORMS } from "./state.js";
import type { BarrelJumperState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("starts on bottom platform, no barrels, 3 lives", () => {
    const s = initialState(42);
    expect(s.platformIdx).toBe(0);
    expect(s.barrels.length).toBe(0);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.onGround).toBe(true);
    expect(s.playerY).toBeCloseTo(PLATFORMS[0]!.y - 0.06, 4);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed same state", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

// ─── 3. Jump sets vy < 0 ─────────────────────────────────────────────────────
describe("jump", () => {
  it("sets playerVy negative and onGround false", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "jump" });
    expect(after.playerVy).toBeLessThan(0);
    expect(after.onGround).toBe(false);
  });

  it("cannot double-jump", () => {
    const s = initialState(42);
    const jumped = reducer(s, { type: "jump" });
    const jumped2 = reducer(jumped, { type: "jump" });
    expect(jumped2.playerVy).toBe(jumped.playerVy); // no change
  });
});

// ─── 4. Move right is clamped to platform edge ───────────────────────────────
describe("move-right clamping", () => {
  it("cannot move past right edge of platform", () => {
    const s = initialState(42);
    let st = s;
    for (let i = 0; i < 30; i++) {
      st = reducer(st, { type: "move-right" });
    }
    expect(st.playerX).toBeLessThanOrEqual(PLATFORMS[0]!.xRight);
  });
});

// ─── 5. Pause / resume ───────────────────────────────────────────────────────
describe("pause/resume", () => {
  it("pause sets paused=true, resume sets paused=false", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "pause" }).paused).toBe(true);
    expect(reducer(reducer(s, { type: "pause" }), { type: "resume" }).paused).toBe(false);
  });
});

// ─── 6. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null while in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: BarrelJumperState = { ...initialState(42), lost: true, score: 150 };
    expect(isTerminal(s)?.score).toBe(150);
  });

  it("score + lives bonus on won", () => {
    const s: BarrelJumperState = { ...initialState(42), won: true, score: 200, lives: 2 };
    expect(isTerminal(s)?.score).toBe(800);
  });
});
