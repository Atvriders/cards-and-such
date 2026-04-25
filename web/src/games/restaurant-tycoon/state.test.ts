import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcCustomers, TOTAL_DAYS } from "./state.js";

describe("Restaurant Tycoon", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.day).toBe(1);
    expect(s.cash).toBe(500);
    expect(s.phase).toBe("plan");
    expect(s.staff).toBe(2);
    expect(s.reputation).toBe(50);
  });

  it("setStaff clamps to 1-5", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setStaff", value: 0 }).staff).toBe(1);
    expect(reducer(s, { type: "setStaff", value: 10 }).staff).toBe(5);
    expect(reducer(s, { type: "setStaff", value: 3 }).staff).toBe(3);
  });

  it("setPrice clamps to 5-30", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setPrice", value: 1 }).menuPrice).toBe(5);
    expect(reducer(s, { type: "setPrice", value: 100 }).menuPrice).toBe(30);
  });

  it("openDay transitions to results and calculates profit", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "openDay" });
    expect(s2.phase).toBe("results");
    expect(s2.lastCustomers).toBeGreaterThanOrEqual(0);
    expect(s2.lastRevenue).toBe(s2.lastCustomers * s.menuPrice);
  });

  it("nextDay advances day and returns to plan", () => {
    const s = reducer(initialState(42), { type: "openDay" });
    expect(s.phase).toBe("results");
    const s2 = reducer(s, { type: "nextDay" });
    expect(s2.day).toBe(2);
    expect(s2.phase).toBe("plan");
  });

  it("calcCustomers returns fewer customers at max price than min price", () => {
    const lowPrice = calcCustomers(5, 5, 0, 50, "salad", () => 0.5);
    const highPrice = calcCustomers(5, 30, 0, 50, "salad", () => 0.5);
    expect(highPrice).toBeLessThanOrEqual(lowPrice);
  });

  it("more staff increases capacity", () => {
    const low = calcCustomers(1, 10, 20, 80, "burger", () => 0.8);
    const high = calcCustomers(5, 10, 20, 80, "burger", () => 0.8);
    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("isTerminal only triggers on done phase", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, phase: "done", cash: 3000 })).toEqual({ score: 100 });
  });

  it("completes all days and reaches done", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_DAYS; i++) {
      s = reducer(s, { type: "openDay" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
