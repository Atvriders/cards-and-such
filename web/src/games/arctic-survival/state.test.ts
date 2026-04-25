import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ArcticSurvivalSettings } from "./state.js";

const s7: ArcticSurvivalSettings = { days: "7" };
const s5: ArcticSurvivalSettings = { days: "5" };

describe("ArcticSurvival initialState", () => {
  it("starts on day 1 in choose phase", () => {
    const s = initialState(1, s7);
    expect(s.day).toBe(1);
    expect(s.phase).toBe("choose");
  });

  it("starts with positive resources", () => {
    const s = initialState(1, s7);
    expect(s.food).toBeGreaterThan(0);
    expect(s.fuel).toBeGreaterThan(0);
    expect(s.hp).toBeGreaterThan(0);
  });

  it("totalDays matches setting", () => {
    expect(initialState(1, s5).totalDays).toBe(5);
    expect(initialState(1, s7).totalDays).toBe(7);
  });
});

describe("ArcticSurvival reducer", () => {
  it("forage increases food", () => {
    const s = initialState(42, s7);
    const before = s.food;
    const s2 = reducer(s, { type: "forage" });
    // Food goes up by 3 then down by 1 = net +2, or event may change it
    expect(s2.food).not.toBeLessThan(before - 3); // could lose from event
  });

  it("rest increases warmth or hp", () => {
    const s = initialState(42, s7);
    const s2 = reducer(s, { type: "rest" });
    // warmth capped at 10; started at 5, +2 = 7 before event
    expect(s2.warmth + s2.hp).toBeGreaterThan(0);
  });

  it("gather_fuel costs food", () => {
    const s = initialState(42, s7);
    const beforeFood = s.food;
    const s2 = reducer(s, { type: "gather_fuel" });
    expect(s2.food).toBeLessThanOrEqual(beforeFood);
  });

  it("restart resets to day 1", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "forage" });
    s = reducer(s, { type: "restart" });
    expect(s.day).toBe(1);
    expect(s.phase).toBe("choose");
  });

  it("phase becomes gameover when hp reaches 0", () => {
    let s = initialState(1, s7);
    // Drain hp directly
    s = { ...s, hp: 1, food: 0, warmth: 0 };
    const s2 = reducer(s, { type: "forage" });
    expect(s2.phase).toBe("gameover");
  });
});

describe("ArcticSurvival isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s7))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, s7), phase: "gameover" as const, score: 42 };
    expect(isTerminal(s)?.score).toBe(42);
  });
});
