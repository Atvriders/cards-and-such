import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSold, TOTAL_DAYS, LOYALTY_COST, UPGRADE_COST } from "./state.js";

describe("Coffee Shop", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(150);
    expect(s.phase).toBe("plan");
    expect(s.batchSize).toBe(30);
    expect(s.loyalty).toBe(0);
  });

  it("setBatch clamps to 1-80", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setBatch", value: 0 }).batchSize).toBe(1);
    expect(reducer(s, { type: "setBatch", value: 200 }).batchSize).toBe(80);
    expect(reducer(s, { type: "setBatch", value: 40 }).batchSize).toBe(40);
  });

  it("setPrice clamps to 2-12", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setPrice", value: 1 }).drinkPrice).toBe(2);
    expect(reducer(s, { type: "setPrice", value: 20 }).drinkPrice).toBe(12);
  });

  it("openDay transitions to results", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastSold).toBeGreaterThanOrEqual(0);
    expect(s2.lastSold).toBeLessThanOrEqual(s.batchSize);
  });

  it("buyLoyalty costs LOYALTY_COST and increments tier", () => {
    const s = { ...initialState(42), cash: 200 };
    const s2 = reducer(s, { type: "buyLoyalty" });
    expect(s2.loyalty).toBe(1);
    expect(s2.cash).toBe(200 - LOYALTY_COST);
  });

  it("buyLoyalty fails with insufficient cash", () => {
    const s = { ...initialState(42), cash: 10 };
    const s2 = reducer(s, { type: "buyLoyalty" });
    expect(s2.loyalty).toBe(0);
    expect(s2.cash).toBe(10);
  });

  it("buyUpgrade increments level", () => {
    const s = { ...initialState(42), cash: 200 };
    const s2 = reducer(s, { type: "buyUpgrade" });
    expect(s2.upgradeLevel).toBe(1);
    expect(s2.cash).toBe(200 - UPGRADE_COST);
  });

  it("calcSold returns fewer units at max price than min price", () => {
    const lowSold = calcSold(50, 2, "tea", 0, 0, () => 0.5);
    const highSold = calcSold(50, 12, "tea", 0, 0, () => 0.5);
    expect(highSold).toBeLessThanOrEqual(lowSold);
  });

  it("higher loyalty boosts demand", () => {
    const low = calcSold(80, 4, "latte", 0, 0, () => 0.7);
    const high = calcSold(80, 4, "latte", 3, 0, () => 0.7);
    expect(high).toBeGreaterThan(low);
  });

  it("isTerminal only triggers on done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 2000 })).toEqual({ score: 100 });
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
