import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { speed: "medium" as const };

describe("initialState", () => {
  it("starts alive on a platform with score 0", () => {
    const s = initialState(1, def);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    expect(s.platforms.length).toBeGreaterThan(0);
    expect(s.playerY).toBeLessThan(1.0);
  });
});

describe("determinism", () => {
  it("same seed produces same state", () => {
    expect(initialState(55, def)).toEqual(initialState(55, def));
  });
});

describe("jump action", () => {
  it("sets negative vy when on ground", () => {
    const s = { ...initialState(1, def), onGround: true };
    const after = reducer(s, { type: "jump" });
    expect(after.playerVy).toBeLessThan(0);
    expect(after.onGround).toBe(false);
  });
  it("does nothing if not on ground", () => {
    const s = { ...initialState(1, def), onGround: false, playerVy: -1 };
    const after = reducer(s, { type: "jump" });
    expect(after.playerVy).toBe(-1);
  });
});

describe("move action", () => {
  it("moves player left and right", () => {
    const s = { ...initialState(1, def), playerX: 0.5 };
    const left = reducer(s, { type: "move", dx: -1 });
    expect(left.playerX).toBeLessThan(0.5);
    const right = reducer(s, { type: "move", dx: 1 });
    expect(right.playerX).toBeGreaterThan(0.5);
  });
});

describe("falling off bottom", () => {
  it("sets over = true when player falls below screen", () => {
    const s = { ...initialState(1, def), playerY: 1.04, playerVy: 0.5, onGround: false };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 100 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});
