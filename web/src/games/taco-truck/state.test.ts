import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSold, TOTAL_DAYS, SALSA_COST, LOCATION_COST } from "./state.js";

describe("Taco Truck", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(1);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(120);
    expect(s.phase).toBe("plan");
    expect(s.tacoCount).toBe(25);
    expect(s.salsaLevel).toBe(0);
  });

  it("setCount clamps to 1-60", () => {
    const s = initialState(1);
    expect(reducer(s, { type: "setCount", value: 0 }).tacoCount).toBe(1);
    expect(reducer(s, { type: "setCount", value: 999 }).tacoCount).toBe(60);
    expect(reducer(s, { type: "setCount", value: 30 }).tacoCount).toBe(30);
  });

  it("setPrice clamps to 2-10", () => {
    const s = initialState(1);
    expect(reducer(s, { type: "setPrice", value: 0 }).tacoPrice).toBe(2);
    expect(reducer(s, { type: "setPrice", value: 99 }).tacoPrice).toBe(10);
  });

  it("openDay transitions to results with sold within batch", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastSold).toBeGreaterThanOrEqual(0);
    expect(s2.lastSold).toBeLessThanOrEqual(s.tacoCount);
  });

  it("buySalsa deducts cost and increments level", () => {
    const s = { ...initialState(1), cash: 200 };
    const s2 = reducer(s, { type: "buySalsa" });
    expect(s2.salsaLevel).toBe(1);
    expect(s2.cash).toBe(200 - SALSA_COST);
  });

  it("buySalsa fails with insufficient cash", () => {
    const s = { ...initialState(1), cash: 5 };
    const s2 = reducer(s, { type: "buySalsa" });
    expect(s2.salsaLevel).toBe(0);
  });

  it("buyLocation deducts cost and increments level", () => {
    const s = { ...initialState(1), cash: 200 };
    const s2 = reducer(s, { type: "buyLocation" });
    expect(s2.locationLevel).toBe(1);
    expect(s2.cash).toBe(200 - LOCATION_COST);
  });

  it("calcSold: higher salsa boosts demand", () => {
    const low = calcSold(60, 4, "beef", 0, 0, () => 0.7);
    const high = calcSold(60, 4, "beef", 3, 0, () => 0.7);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("isTerminal only on done phase", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 1500 })).toEqual({ score: 100 });
  });

  it("completes all days", () => {
    let s = initialState(7);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "openDay" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
  });
});
