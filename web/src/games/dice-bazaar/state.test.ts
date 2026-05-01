import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TURNS } from "./state.js";

const S = { dummy: false };

describe("dice-bazaar", () => {
  it("starts with 12 gold, no inventory", () => {
    const s = initialState(1, S);
    expect(s.gold).toBe(12);
    expect(s.inventory.silk).toBe(0);
  });
  it("buying spends gold and adds inventory", () => {
    const s0 = initialState(2, S);
    const s = reducer(s0, { type: "buy", good: "silk" });
    expect(s.inventory.silk).toBe(1);
    expect(s.gold).toBe(s0.gold - s0.prices.silk);
  });
  it("can't buy without enough gold", () => {
    let s = initialState(3, S);
    s = { ...s, gold: 0 };
    const r = reducer(s, { type: "buy", good: "gem" });
    expect(r).toBe(s);
  });
  it("selling returns gold and adds score", () => {
    let s = reducer(initialState(4, S), { type: "buy", good: "silk" });
    const beforeScore = s.score;
    s = reducer(s, { type: "sell", good: "silk" });
    expect(s.inventory.silk).toBe(0);
    expect(s.score).toBeGreaterThanOrEqual(beforeScore);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(5, S))).toBeNull();
  });
  it("game ends after TURNS days", () => {
    let s = initialState(6, S);
    for (let i = 0; i < TURNS; i++) s = reducer(s, { type: "next" });
    expect(s.phase).toBe("done");
  });
});
