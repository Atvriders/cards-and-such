import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, portfolioValue, TOTAL_TURNS, START_CASH, NUM_STOCKS } from "./state.js";

describe("Stock Ticker", () => {
  it("initializes with correct cash and 5 stocks", () => {
    const s = initialState(42);
    expect(s.cash).toBe(START_CASH);
    expect(s.prices.length).toBe(NUM_STOCKS);
    expect(s.shares).toEqual([0, 0, 0, 0, 0]);
    expect(s.turn).toBe(0);
    expect(s.phase).toBe("trading");
  });

  it("buying shares reduces cash and adds shares", () => {
    const s = initialState(42);
    const price = s.prices[0]!;
    const s2 = reducer(s, { type: "buy", stock: 0, qty: 2 });
    expect(s2.shares[0]).toBe(2);
    expect(s2.cash).toBeCloseTo(START_CASH - price * 2, 1);
  });

  it("cannot buy more than cash allows", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", stock: 0, qty: 999 });
    expect(s2.lastMsg).toContain("Not enough cash");
    expect(s2.shares[0]).toBe(0);
  });

  it("selling shares adds cash and reduces shares", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", stock: 1, qty: 3 });
    const price = s2.prices[1]!;
    const s3 = reducer(s2, { type: "sell", stock: 1, qty: 2 });
    expect(s3.shares[1]).toBe(1);
    expect(s3.cash).toBeCloseTo(s2.cash + price * 2, 1);
  });

  it("cannot sell more shares than held", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "sell", stock: 0, qty: 5 });
    expect(s2.lastMsg).toContain("Not enough shares");
  });

  it("tick advances turn and updates prices", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.turn).toBe(1);
    expect(s2.prices).not.toEqual(s.prices);
  });

  it("reaches done after TOTAL_TURNS ticks", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("portfolioValue sums shares times prices", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", stock: 0, qty: 2 });
    const expected = s2.prices[0]! * 2;
    expect(portfolioValue(s2)).toBeCloseTo(expected, 1);
  });

  it("isTerminal returns null during game", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });
});
