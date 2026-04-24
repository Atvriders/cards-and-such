import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcSales, TOTAL_DAYS } from "./state.js";

describe("Lemonade Stand", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.money).toBe(200);
    expect(s.phase).toBe("planning");
    expect(s.price).toBe(25);
    expect(s.cups).toBe(20);
  });

  it("setPrice clamps to 10-100", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setPrice", value: 5 }).price).toBe(10);
    expect(reducer(s, { type: "setPrice", value: 200 }).price).toBe(100);
    expect(reducer(s, { type: "setPrice", value: 50 }).price).toBe(50);
  });

  it("setCups clamps to 1-50", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setCups", value: 0 }).cups).toBe(1);
    expect(reducer(s, { type: "setCups", value: 100 }).cups).toBe(50);
  });

  it("sell transitions to results phase and computes profit", () => {
    const s = initialState(42);
    const s2 = reducer(reducer(s, { type: "setPrice", value: 10 }), { type: "setCups", value: 10 });
    const s3 = reducer(s2, { type: "sell" });
    expect(s3.phase).toBe("results");
    expect(s3.lastSold).toBeGreaterThanOrEqual(0);
    expect(s3.lastSold).toBeLessThanOrEqual(10);
    expect(s3.lastCost).toBe(10 * 4 + s2.adBudget);
  });

  it("nextDay advances day and resets to planning", () => {
    const s = reducer(initialState(42), { type: "sell" });
    expect(s.phase).toBe("results");
    const s2 = reducer(s, { type: "nextDay" });
    expect(s2.day).toBe(2);
    expect(s2.phase).toBe("planning");
  });

  it("calcSales returns 0 for very high price", () => {
    const sold = calcSales(20, 100, 0, "rainy", () => 0.5);
    expect(sold).toBe(0);
  });

  it("hot weather gives more sales than rainy", () => {
    const hotSold = calcSales(50, 20, 10, "hot", () => 0.5);
    const rainySold = calcSales(50, 20, 10, "rainy", () => 0.5);
    expect(hotSold).toBeGreaterThan(rainySold);
  });

  it("isTerminal only triggers on done phase", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", money: 500 })).toEqual({ score: 50 });
  });

  it("completes 7 days and reaches done", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "sell" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
