import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSold, TOTAL_DAYS, SAUCE_COST, MARKETING_COST } from "./state.js";

describe("Pasta Shop", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(5);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(130);
    expect(s.phase).toBe("plan");
    expect(s.batchSize).toBe(28);
    expect(s.pasta).toBe("spaghetti");
  });

  it("setBatch clamps to 1-70", () => {
    const s = initialState(5);
    expect(reducer(s, { type: "setBatch", value: 0 }).batchSize).toBe(1);
    expect(reducer(s, { type: "setBatch", value: 200 }).batchSize).toBe(70);
    expect(reducer(s, { type: "setBatch", value: 40 }).batchSize).toBe(40);
  });

  it("setPrice clamps to 3-14", () => {
    const s = initialState(5);
    expect(reducer(s, { type: "setPrice", value: 1 }).portionPrice).toBe(3);
    expect(reducer(s, { type: "setPrice", value: 50 }).portionPrice).toBe(14);
  });

  it("openDay produces results with valid sold count", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastSold).toBeGreaterThanOrEqual(0);
    expect(s2.lastSold).toBeLessThanOrEqual(s.batchSize);
  });

  it("buySauce increments sauceLevel and deducts cash", () => {
    const s = { ...initialState(5), cash: 200 };
    const s2 = reducer(s, { type: "buySauce" });
    expect(s2.sauceLevel).toBe(1);
    expect(s2.cash).toBe(200 - SAUCE_COST);
  });

  it("buySauce fails if cash insufficient", () => {
    const s = { ...initialState(5), cash: 10 };
    expect(reducer(s, { type: "buySauce" }).sauceLevel).toBe(0);
  });

  it("buyMarketing increments marketingLevel", () => {
    const s = { ...initialState(5), cash: 200 };
    const s2 = reducer(s, { type: "buyMarketing" });
    expect(s2.marketingLevel).toBe(1);
    expect(s2.cash).toBe(200 - MARKETING_COST);
  });

  it("calcSold: higher marketing yields more sales", () => {
    const low = calcSold(70, 5, "spaghetti", 0, 0, () => 0.7);
    const high = calcSold(70, 5, "spaghetti", 0, 3, () => 0.7);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("isTerminal returns null when playing", () => {
    const s = initialState(5);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 1800 })).toEqual({ score: 100 });
  });

  it("advances through all days to done", () => {
    let s = initialState(9);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "openDay" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
  });
});
