import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, LEVELS } from "./state.js";
import type { QJumpState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("builds pyramid with correct cube count and player at top", () => {
    const s = initialState(42);
    const expected = (LEVELS * (LEVELS + 1)) / 2;
    expect(s.cubes.length).toBe(expected);
    expect(s.playerRow).toBe(0);
    expect(s.playerCol).toBe(0);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.won).toBe(false);
    expect(s.lost).toBe(false);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed gives same state", () => {
    expect(initialState(5)).toEqual(initialState(5));
  });
});

// ─── 3. Jump dl lands on new cube and scores ─────────────────────────────────
describe("jump dl", () => {
  it("moves to row=1 col=0 and scores 25", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "jump", dir: "dl" });
    expect(after.playerRow).toBe(1);
    expect(after.playerCol).toBe(0);
    expect(after.score).toBe(25);
  });
});

// ─── 4. Jump off pyramid loses a life ────────────────────────────────────────
describe("jump off edge", () => {
  it("jumping ul from top loses a life and resets to top", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "jump", dir: "ul" });
    expect(after.lives).toBe(2);
    expect(after.playerRow).toBe(0);
    expect(after.playerCol).toBe(0);
  });
});

// ─── 5. Already colored cube gives no score ───────────────────────────────────
describe("revisiting a cube", () => {
  it("no additional score for already-colored cube", () => {
    const s = initialState(42); // top already colored
    const afterFirst = reducer(s, { type: "jump", dir: "dl" });
    const backToTop = reducer(afterFirst, { type: "jump", dir: "ur" });
    expect(backToTop.score).toBe(25); // only one score for original visit
  });
});

// ─── 6. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null during game", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score when lost", () => {
    const s: QJumpState = { ...initialState(42), lost: true, score: 75 };
    expect(isTerminal(s)?.score).toBe(75);
  });

  it("returns score+lives*200 when won", () => {
    const s: QJumpState = { ...initialState(42), won: true, score: 100, lives: 3 };
    expect(isTerminal(s)?.score).toBe(700);
  });
});
