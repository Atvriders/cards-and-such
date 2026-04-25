import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DodgeCarsState } from "./state.js";

const def = { lanes: "3" as const, speed: "medium" as const };

describe("initialState", () => {
  it("starts alive, score 0, no cars", () => {
    const s = initialState(1, def);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    expect(s.cars.length).toBe(0);
    expect(s.playerLane).toBe(1); // middle of 3 lanes
  });
});

describe("determinism", () => {
  it("same seed gives same state", () => {
    expect(initialState(42, def)).toEqual(initialState(42, def));
  });
});

describe("move action", () => {
  it("changes player lane within bounds", () => {
    const s = initialState(1, def);
    const moved = reducer(s, { type: "move", lane: 2 });
    expect(moved.playerLane).toBe(2);
    const clamped = reducer(s, { type: "move", lane: 99 });
    expect(clamped.playerLane).toBe(2); // clamped to lanes-1
  });
});

describe("collision detection", () => {
  it("over becomes true when car hits player lane at player row", () => {
    const base = initialState(1, def);
    const withCar: DodgeCarsState = {
      ...base,
      playerLane: 1,
      cars: [{ id: 0, lane: 1, y: 0.85, vy: 0.3 }],
    };
    const after = reducer(withCar, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("cars spawn over time", () => {
  it("cars appear after ticks", () => {
    let s = initialState(1, def);
    for (let i = 0; i < 120; i++) s = reducer(s, { type: "tick", dt: 0.016 });
    expect(s.cars.length + s.score).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("null when alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 55 };
    expect(isTerminal(s)).toEqual({ score: 55 });
  });
});
