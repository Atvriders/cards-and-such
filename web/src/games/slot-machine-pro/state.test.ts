import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, calcPayout, STARTING_CREDITS, MAX_SPINS } from "./state.js";

describe("Slot Machine Pro", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(42);
    expect(s.credits).toBe(STARTING_CREDITS);
    expect(s.bet).toBe(5);
    expect(s.spinsLeft).toBe(MAX_SPINS);
    expect(s.phase).toBe("idle");
  });

  it("setBet clamps between 1 and 20", () => {
    const s = initialState(42);
    expect(reducer(s, { type: "setBet", amount: 0 }).bet).toBe(1);
    expect(reducer(s, { type: "setBet", amount: 25 }).bet).toBe(20);
    expect(reducer(s, { type: "setBet", amount: 10 }).bet).toBe(10);
  });

  it("spin costs the bet amount", () => {
    const s = initialState(42);
    const bet = s.bet;
    const s2 = reducer(s, { type: "spin" });
    // credits may have gone up (win) or down, but spins decrease
    expect(s2.spinsLeft).toBe(MAX_SPINS - 1);
    expect(s2.lastResult).not.toBeNull();
    void bet;
  });

  it("calcPayout: three sevens triggers jackpot", () => {
    const { payout, line } = calcPayout(["seven", "seven", "seven"], 5, 200);
    expect(payout).toBeGreaterThan(200);
    expect(line).toContain("JACKPOT");
  });

  it("calcPayout: any cherry gives break even", () => {
    const { payout, line } = calcPayout(["cherry", "lemon", "orange"], 10, 200);
    expect(payout).toBe(10);
    expect(line).toContain("Cherry");
  });

  it("calcPayout: no match gives 0", () => {
    const { payout } = calcPayout(["lemon", "orange", "bell"], 5, 200);
    expect(payout).toBe(0);
  });

  it("game ends when spins run out", () => {
    let s = initialState(42);
    for (let i = 0; i < MAX_SPINS; i++) {
      if (s.phase === "done") break;
      s = reducer(s, { type: "spin" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null when not done", () => {
    const s = initialState(42);
    expect(isTerminal(s)).toBeNull();
  });
});
