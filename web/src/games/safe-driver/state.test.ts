import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SafeDriverSettings } from "./state.js";

const settings: SafeDriverSettings = { speed: "normal" };

describe("SafeDriver initialState", () => {
  it("starts in lane 1 with 3 lives", () => {
    const s = initialState(1, settings);
    expect(s.playerLane).toBe(1);
    expect(s.lives).toBe(3);
    expect(s.gameOver).toBe(false);
  });

  it("has no obstacles at start", () => {
    const s = initialState(1, settings);
    expect(s.obstacles).toHaveLength(0);
  });
});

describe("SafeDriver reducer", () => {
  it("moves player left", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "left" });
    expect(s2.playerLane).toBe(0);
  });

  it("moves player right", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "right" });
    expect(s2.playerLane).toBe(2);
  });

  it("clamps lane at 0", () => {
    const s = initialState(1, settings);
    const s2 = reducer(reducer(s, { type: "left" }), { type: "left" });
    expect(s2.playerLane).toBe(0);
  });

  it("clamps lane at 2", () => {
    const s = initialState(1, settings);
    const s2 = reducer(reducer(s, { type: "right" }), { type: "right" });
    expect(s2.playerLane).toBe(2);
  });

  it("distance increments on tick", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.distance).toBe(1);
  });

  it("restart resets state", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "tick" });
    const s2 = reducer(s, { type: "restart" });
    expect(s2.gameOver).toBe(false);
    expect(s2.distance).toBe(0);
    expect(s2.lives).toBe(3);
  });
});

describe("SafeDriver isTerminal", () => {
  it("returns null when not over", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, settings), gameOver: true, distance: 100 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
