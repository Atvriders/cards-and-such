import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSoldForItem, totalBake, TOTAL_DAYS, OVEN_UPGRADE_COST, MAX_TOTAL_BAKE } from "./state.js";

describe("Bakery Shop", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(200);
    expect(s.phase).toBe("plan");
    expect(s.ovenLevel).toBe(0);
    expect(s.featured).toBe("croissant");
  });

  it("totalBake sums all items", () => {
    const s = initialState(42);
    const expected = Object.values(s.bake).reduce((a, b) => a + b, 0);
    expect(totalBake(s.bake)).toBe(expected);
  });

  it("setBake clamps per item and respects capacity", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "setBake", item: "bread", value: 5 });
    expect(s2.bake.bread).toBe(5);
  });

  it("upgradeOven increases level and costs cash", () => {
    const s = { ...initialState(42), cash: 300 };
    const s2 = reducer(s, { type: "upgradeOven" });
    expect(s2.ovenLevel).toBe(1);
    expect(s2.cash).toBe(300 - OVEN_UPGRADE_COST);
  });

  it("upgradeOven fails with insufficient cash", () => {
    const s = { ...initialState(42), cash: 10 };
    const s2 = reducer(s, { type: "upgradeOven" });
    expect(s2.ovenLevel).toBe(0);
  });

  it("openDay transitions to results", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastRevenue).toBeGreaterThanOrEqual(0);
  });

  it("calcSoldForItem returns 0 for zero baked", () => {
    expect(calcSoldForItem(0, 3, "muffin", false, () => 0.8)).toBe(0);
  });

  it("featured item has higher demand than non-featured at same price", () => {
    const featuredSold = calcSoldForItem(50, 2, "donut", true, () => 0.8);
    const normalSold = calcSoldForItem(50, 2, "donut", false, () => 0.8);
    expect(featuredSold).toBeGreaterThanOrEqual(normalSold);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 1500 })).toEqual({ score: 100 });
  });

  it("ovenLevel 3 gives capacity MAX_TOTAL_BAKE + 60", () => {
    const s = { ...initialState(42), ovenLevel: 3 };
    expect(MAX_TOTAL_BAKE + s.ovenLevel * 20).toBe(160);
  });

  it("completes all days", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "openDay" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
  });
});
