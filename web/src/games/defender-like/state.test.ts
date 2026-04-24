import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SkyDefenderState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("starts with humans, aliens, 3 lives, no bullets", () => {
    const s = initialState(42);
    expect(s.humans.length).toBe(10);
    expect(s.aliens.length).toBe(8);
    expect(s.bullets.length).toBe(0);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
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

// ─── 3. Fire adds bullet ─────────────────────────────────────────────────────
describe("fire", () => {
  it("adds a bullet with vx in facing direction", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "fire" });
    expect(after.bullets.length).toBe(1);
    expect(after.bullets[0]!.vx).toBeGreaterThan(0); // default facing right
  });
});

// ─── 4. Move updates ship position and camera ─────────────────────────────────
describe("move", () => {
  it("moving right increases shipX and updates camera", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "move", dx: 0.2, dy: 0 });
    expect(after.shipX).toBeGreaterThan(s.shipX);
    expect(after.shipFacing).toBe(1);
  });

  it("moving left sets facing left", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "move", dx: -0.1, dy: 0 });
    expect(after.shipFacing).toBe(-1);
  });
});

// ─── 5. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null while in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: SkyDefenderState = { ...initialState(42), lost: true, score: 600 };
    expect(isTerminal(s)?.score).toBe(600);
  });

  it("score + lives bonus on won", () => {
    const s: SkyDefenderState = { ...initialState(42), won: true, score: 1500, lives: 2 };
    expect(isTerminal(s)?.score).toBe(3500);
  });
});

// ─── 6. Pause/resume ─────────────────────────────────────────────────────────
describe("pause/resume", () => {
  it("sets paused correctly", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "pause" }).paused).toBe(true);
    expect(reducer(reducer(s, { type: "pause" }), { type: "resume" }).paused).toBe(false);
  });
});
