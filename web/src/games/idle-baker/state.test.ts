import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ovenCost, assistantCost } from "./state.js";

const defaultSettings = { goal: "300" as const };

describe("initialState", () => {
  it("starts with 0 pastries and 1 oven", () => {
    const s = initialState(1, defaultSettings);
    expect(s.pastries).toBe(0);
    expect(s.ovens).toBe(1);
    expect(s.assistants).toBe(0);
    expect(s.gameOver).toBe(false);
  });

  it("goal matches setting", () => {
    expect(initialState(1, { goal: "1500" }).goal).toBe(1500);
  });
});

describe("reducer — bake", () => {
  it("earns pastries on bake", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "bake" });
    expect(s2.pastries).toBeGreaterThanOrEqual(s.bakePower * s.ovens);
    expect(s2.bakes).toBe(1);
  });

  it("ends game when goal reached", () => {
    const s = initialState(1, defaultSettings);
    const near = { ...s, pastries: 295, bakePower: 10, ovens: 1 };
    const s2 = reducer(near, { type: "bake" });
    expect(s2.gameOver).toBe(true);
  });

  it("is no-op after game over", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true };
    expect(reducer(s, { type: "bake" })).toBe(s);
  });
});

describe("reducer — buyOven", () => {
  it("refuses without pastries", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "buyOven" }).ovens).toBe(1);
  });

  it("adds oven when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = ovenCost(1);
    const rich = { ...s, pastries: cost };
    const s2 = reducer(rich, { type: "buyOven" });
    expect(s2.ovens).toBe(2);
  });

  it("oven cost scales", () => {
    expect(ovenCost(1)).toBe(35);
    expect(ovenCost(2)).toBe(70);
  });
});

describe("reducer — hireAssistant", () => {
  it("hires when affordable", () => {
    const s = initialState(1, defaultSettings);
    const cost = assistantCost(0);
    const rich = { ...s, pastries: cost };
    const s2 = reducer(rich, { type: "hireAssistant" });
    expect(s2.assistants).toBe(1);
    expect(s2.bakePower).toBe(s.bakePower + 1);
  });
});

describe("reducer — tick", () => {
  it("no passive without assistants", () => {
    const s = initialState(1, defaultSettings);
    expect(reducer(s, { type: "tick" }).pastries).toBe(0);
  });

  it("assistants produce pastries per tick", () => {
    const s = initialState(1, defaultSettings);
    const s2 = reducer({ ...s, assistants: 2, ovens: 3 }, { type: "tick" });
    expect(s2.pastries).toBe(6); // 2 * 3
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });

  it("returns score on completion", () => {
    const s = { ...initialState(1, defaultSettings), gameOver: true, pastries: 300 };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });
});
