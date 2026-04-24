import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, totalValue, portfolioValue, TOTAL_TURNS, STARTING_CASH } from "./state.js";

describe("Stock Market Mini", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.turn).toBe(1);
    expect(s.cash).toBe(STARTING_CASH);
    expect(s.phase).toBe("trading");
    expect(s.stocks.length).toBe(5);
    expect(s.portfolio).toEqual([0, 0, 0, 0, 0]);
  });

  it("buying shares deducts cash and adds to portfolio", () => {
    const s = initialState(42);
    const price = s.stocks[0]?.price ?? 0;
    const s2 = reducer(s, { type: "buy", stockIndex: 0, shares: 2 });
    expect(s2.portfolio[0]).toBe(2);
    expect(s2.cash).toBeCloseTo(STARTING_CASH - price * 2, 1);
  });

  it("cannot buy more than cash allows", () => {
    const s = { ...initialState(42), cash: 5 };
    const s2 = reducer(s, { type: "buy", stockIndex: 0, shares: 10 });
    expect(s2.portfolio[0]).toBe(0);
    expect(s2.cash).toBe(5);
  });

  it("selling shares adds cash and reduces portfolio", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", stockIndex: 1, shares: 3 });
    const price = s2.stocks[1]?.price ?? 0;
    const s3 = reducer(s2, { type: "sell", stockIndex: 1, shares: 2 });
    expect(s3.portfolio[1]).toBe(1);
    expect(s3.cash).toBeCloseTo(s2.cash + price * 2, 1);
  });

  it("cannot sell more than held", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "sell", stockIndex: 0, shares: 5 });
    expect(s2.portfolio[0]).toBe(0);
    expect(s2.cash).toBe(STARTING_CASH);
  });

  it("endTurn advances prices and turn counter", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "endTurn" });
    expect(s2.turn).toBe(2);
    // Prices should differ (seeded random walk)
    expect(s2.stocks.every((st, i) => st.history.length === 2)).toBe(true);
  });

  it("portfolioValue calculates correctly", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "buy", stockIndex: 0, shares: 2 });
    expect(portfolioValue(s2)).toBeCloseTo((s.stocks[0]?.price ?? 0) * 2, 1);
  });

  it("game ends after 30 turns and liquidates portfolio", () => {
    let s = initialState(42);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("done");
    expect(s.portfolio).toEqual([0, 0, 0, 0, 0]);
    expect(isTerminal(s)).not.toBeNull();
  });
});
