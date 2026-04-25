import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { volatility: "medium" as const };

describe("initialState", () => {
  it("starts with 5 stocks, $10000 cash, day 1", () => {
    const s = initialState(1, settings);
    expect(s.portfolio).toHaveLength(5);
    expect(s.cash).toBe(10000);
    expect(s.day).toBe(1);
    expect(s.over).toBe(false);
  });
});

describe("buy", () => {
  it("buys shares and deducts cash", () => {
    const s = initialState(1, settings);
    const ticker = s.portfolio[0]!.ticker;
    const price = s.portfolio[0]!.price;
    const s2 = reducer(s, { type: "buy", ticker, qty: 2 });
    expect(s2.portfolio[0]!.shares).toBe(2);
    expect(s2.cash).toBeCloseTo(10000 - price * 2, 1);
  });

  it("rejects buy when insufficient cash", () => {
    const s = { ...initialState(1, settings), cash: 0 };
    const ticker = s.portfolio[0]!.ticker;
    const s2 = reducer(s, { type: "buy", ticker, qty: 1 });
    expect(s2.portfolio[0]!.shares).toBe(0);
    expect(s2.log).toMatch(/not enough cash/i);
  });
});

describe("sell", () => {
  it("sells shares and adds cash", () => {
    const s = initialState(1, settings);
    const ticker = s.portfolio[0]!.ticker;
    const price = s.portfolio[0]!.price;
    let s2 = reducer(s, { type: "buy", ticker, qty: 3 });
    s2 = reducer(s2, { type: "sell", ticker, qty: 2 });
    expect(s2.portfolio[0]!.shares).toBe(1);
    expect(s2.cash).toBeCloseTo(10000 - price, 1);
  });

  it("rejects sell when not enough shares", () => {
    const s = initialState(1, settings);
    const ticker = s.portfolio[0]!.ticker;
    const s2 = reducer(s, { type: "sell", ticker, qty: 5 });
    expect(s2.log).toMatch(/don't own/i);
  });
});

describe("next-day and isTerminal", () => {
  it("advances the day and updates prices", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "next-day" });
    expect(s2.day).toBe(2);
    // Prices may or may not change by much but should be positive
    for (const stock of s2.portfolio) {
      expect(stock.price).toBeGreaterThan(0);
    }
  });

  it("ends game after maxDays", () => {
    let s = { ...initialState(1, settings), day: 20 };
    s = reducer(s, { type: "next-day" });
    expect(s.over).toBe(true);
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("null terminal during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
});
