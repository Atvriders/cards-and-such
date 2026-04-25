import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "10" as const };

describe("DiceCoinBet", () => {
  it("starts with 100 coins", () => { expect(initialState(1, S).coins).toBe(100); });
  it("bet rolls die and changes coins", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "bet", amount: 10, side: "odd" });
    expect(s2.dieResult).not.toBeNull();
    expect(s2.dieResult).toBeGreaterThanOrEqual(1);
    expect(s2.dieResult).toBeLessThanOrEqual(6);
  });
  it("win adds coins, lose removes coins", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "bet", amount: 10, side: "odd" });
    if (s2.lastWin) expect(s2.coins).toBe(110);
    else expect(s2.coins).toBe(90);
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
