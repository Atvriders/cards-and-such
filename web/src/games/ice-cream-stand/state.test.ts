import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Ice Cream Stand", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(11);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(150);
    expect(s.phase).toBe("plan");
    expect(s.toppingsLevel).toBe(0);
  });

  it("setScoops clamps to 0-40", () => {
    const s = initialState(11);
    const s2 = reducer(s, { type: "setScoops", flavor: "vanilla", value: 100 });
    expect(s2.scoops.vanilla).toBe(40);
    const s3 = reducer(s, { type: "setScoops", flavor: "vanilla", value: -5 });
    expect(s3.scoops.vanilla).toBe(0);
  });

  it("openStand transitions to results", () => {
    const s = initialState(11);
    const s2 = reducer(s, { type: "openStand" });
    expect(s2.phase).toBe("results");
    expect(s2.lastRevenue).toBeGreaterThanOrEqual(0);
  });

  it("nextDay increments day from results", () => {
    const s = initialState(11);
    const s2 = reducer(s, { type: "openStand" });
    const s3 = reducer(s2, { type: "nextDay" });
    expect(s3.day).toBe(2);
    expect(s3.phase).toBe("plan");
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(11))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = { ...initialState(11), phase: "done" as const, cash: 800 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("buyToppings costs 40 cash", () => {
    const s = { ...initialState(11), cash: 100 };
    const s2 = reducer(s, { type: "buyToppings" });
    expect(s2.toppingsLevel).toBe(1);
    expect(s2.cash).toBe(60);
  });
});
