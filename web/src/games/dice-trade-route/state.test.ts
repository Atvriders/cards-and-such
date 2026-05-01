import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, STOPS, STARTING_GOODS } from "./state.js";

const S = { dummy: false };

describe("dice-trade-route", () => {
  it("starts at first stop, full goods", () => {
    const s = initialState(1, S);
    expect(s.stop).toBe(0);
    expect(s.goods).toBe(STARTING_GOODS);
  });
  it("selling reduces goods, raises score", () => {
    const s = reducer(initialState(2, S), { type: "sell", amount: 3 });
    expect(s.goods).toBe(STARTING_GOODS - 3);
    expect(s.score).toBeGreaterThan(0);
  });
  it("can't sell more than you have", () => {
    let s = initialState(3, S);
    s = { ...s, goods: 1 };
    const r = reducer(s, { type: "sell", amount: 5 });
    expect(r.goods).toBe(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(4, S))).toBeNull();
  });
  it("game ends after STOPS stops", () => {
    let s = initialState(5, S);
    for (let i = 0; i < STOPS && s.phase !== "done"; i++) {
      s = reducer(s, { type: "sell", amount: 0 });
      s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
});
