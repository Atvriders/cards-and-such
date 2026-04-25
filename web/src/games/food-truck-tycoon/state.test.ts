import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FoodTruckTycoonSettings } from "./state.js";

const s5: FoodTruckTycoonSettings = { days: "5" };
const s7: FoodTruckTycoonSettings = { days: "7" };

describe("FoodTruckTycoon initialState", () => {
  it("starts on day 1 in prep phase with $30", () => {
    const s = initialState(1, s7);
    expect(s.day).toBe(1);
    expect(s.phase).toBe("prep");
    expect(s.money).toBe(30);
  });

  it("has 5 menu items with stock", () => {
    const s = initialState(1, s7);
    expect(s.menu).toHaveLength(5);
    for (const m of s.menu) expect(m.stock).toBeGreaterThan(0);
  });

  it("total days matches setting", () => {
    expect(initialState(1, s5).totalDays).toBe(5);
    expect(initialState(1, s7).totalDays).toBe(7);
  });
});

describe("FoodTruckTycoon reducer", () => {
  it("restock adds stock and deducts money", () => {
    const s = initialState(1, s7);
    const item = s.menu[0]!;
    const before = s.money;
    const s2 = reducer(s, { type: "restock", item: item.item, qty: 5 });
    expect(s2.menu[0]!.stock).toBe(item.stock + 5);
    expect(s2.money).toBe(before - item.cost * 5);
  });

  it("setPrice updates menu price", () => {
    const s = initialState(1, s7);
    const item = s.menu[0]!;
    const s2 = reducer(s, { type: "setPrice", item: item.item, price: 10 });
    expect(s2.menu[0]!.price).toBe(10);
  });

  it("openForBusiness switches to report phase", () => {
    const s = initialState(1, s7);
    const s2 = reducer(s, { type: "openForBusiness" });
    expect(s2.phase).toBe("report");
  });

  it("nextDay advances to day 2", () => {
    let s = initialState(1, s7);
    s = reducer(s, { type: "openForBusiness" });
    s = reducer(s, { type: "nextDay" });
    expect(s.day).toBe(2);
    expect(s.phase).toBe("prep");
  });

  it("game ends after all days", () => {
    let s = initialState(1, s5);
    for (let d = 0; d < 5; d++) {
      s = reducer(s, { type: "openForBusiness" });
      s = reducer(s, { type: "nextDay" });
    }
    expect(s.gameOver).toBe(true);
  });

  it("restart resets to fresh state", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "openForBusiness" });
    s = reducer(s, { type: "restart" });
    expect(s.day).toBe(1);
    expect(s.money).toBe(30);
    expect(s.phase).toBe("prep");
  });
});

describe("FoodTruckTycoon isTerminal", () => {
  it("returns null when not game over", () => {
    expect(isTerminal(initialState(1, s7))).toBeNull();
  });

  it("returns score based on totalProfit", () => {
    const s = { ...initialState(1, s7), gameOver: true, totalProfit: 50 };
    expect(isTerminal(s)?.score).toBe(50);
  });

  it("score capped at 100", () => {
    const s = { ...initialState(1, s7), gameOver: true, totalProfit: 200 };
    expect(isTerminal(s)?.score).toBe(100);
  });
});
