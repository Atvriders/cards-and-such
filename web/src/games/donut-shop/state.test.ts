import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSold, TOTAL_DAYS, GLAZE_COST, DISPLAY_COST } from "./state.js";

describe("Donut Shop", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(3);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(100);
    expect(s.phase).toBe("plan");
    expect(s.dozenCount).toBe(8);
    expect(s.flavor).toBe("glazed");
  });

  it("setDozens clamps to 1-20", () => {
    const s = initialState(3);
    expect(reducer(s, { type: "setDozens", value: 0 }).dozenCount).toBe(1);
    expect(reducer(s, { type: "setDozens", value: 100 }).dozenCount).toBe(20);
    expect(reducer(s, { type: "setDozens", value: 10 }).dozenCount).toBe(10);
  });

  it("setPrice clamps to 4-18", () => {
    const s = initialState(3);
    expect(reducer(s, { type: "setPrice", value: 1 }).donutPrice).toBe(4);
    expect(reducer(s, { type: "setPrice", value: 30 }).donutPrice).toBe(18);
  });

  it("openDay transitions to results with valid sold", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastSold).toBeGreaterThanOrEqual(0);
    expect(s2.lastSold).toBeLessThanOrEqual(s.dozenCount);
  });

  it("buyGlaze increments level and deducts cost", () => {
    const s = { ...initialState(3), cash: 200 };
    const s2 = reducer(s, { type: "buyGlaze" });
    expect(s2.glazeLevel).toBe(1);
    expect(s2.cash).toBe(200 - GLAZE_COST);
  });

  it("buyGlaze fails with insufficient cash", () => {
    const s = { ...initialState(3), cash: 5 };
    expect(reducer(s, { type: "buyGlaze" }).glazeLevel).toBe(0);
  });

  it("buyDisplay increments level", () => {
    const s = { ...initialState(3), cash: 200 };
    const s2 = reducer(s, { type: "buyDisplay" });
    expect(s2.displayLevel).toBe(1);
    expect(s2.cash).toBe(200 - DISPLAY_COST);
  });

  it("calcSold: display boost increases demand", () => {
    const low = calcSold(20, 6, "glazed", 0, 0, () => 0.7);
    const high = calcSold(20, 6, "glazed", 0, 3, () => 0.7);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(3);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 1200 })).toEqual({ score: 100 });
  });

  it("completes all days", () => {
    let s = initialState(11);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "openDay" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
  });
});
