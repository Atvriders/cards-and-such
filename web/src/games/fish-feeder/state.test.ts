import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts alive with score 0 and fishes", () => {
    const s = initialState(1, def);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    expect(s.fishes.length).toBeGreaterThan(0);
  });
});

describe("determinism", () => {
  it("same seed gives same state", () => {
    expect(initialState(77, def)).toEqual(initialState(77, def));
  });
});

describe("move action", () => {
  it("player moves to clamped position", () => {
    const s = initialState(1, def);
    const after = reducer(s, { type: "move", x: 0.3, y: 0.7 });
    expect(after.player.x).toBeCloseTo(0.3);
    expect(after.player.y).toBeCloseTo(0.7);
    const clamped = reducer(s, { type: "move", x: -1, y: 5 });
    expect(clamped.player.x).toBe(0.01);
    expect(clamped.player.y).toBe(0.99);
  });
});

describe("eating smaller fish", () => {
  it("score increases when colliding with a smaller fish", () => {
    const s = initialState(1, def);
    const smallFish = { id: 999, x: s.player.x, y: s.player.y, vx: 0, vy: 0, size: 0.01, isPlayer: false as const };
    const withFish = { ...s, fishes: [smallFish] };
    const after = reducer(withFish, { type: "tick", dt: 0.016 });
    expect(after.score).toBeGreaterThan(0);
  });
});

describe("larger fish kills player", () => {
  it("over becomes true when colliding with larger fish", () => {
    const s = initialState(1, def);
    const bigFish = { id: 998, x: s.player.x, y: s.player.y, vx: 0, vy: 0, size: 0.5, isPlayer: false as const };
    const withFish = { ...s, fishes: [bigFish] };
    const after = reducer(withFish, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 42 };
    expect(isTerminal(s)).toEqual({ score: 42 });
  });
});
