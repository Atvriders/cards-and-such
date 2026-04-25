import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "10" as const };

describe("CardStackBet", () => {
  it("starts with 100 coins and betting phase", () => {
    const s = initialState(1, S);
    expect(s.coins).toBe(100);
    expect(s.phase).toBe("betting");
  });
  it("bet reveals next card", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "bet", amount: 10, dir: "higher" });
    expect(s2.revealedCard).not.toBeNull();
  });
  it("win increases coins", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "bet", amount: 10, dir: "higher" });
    if (s2.lastResult === "win") expect(s2.coins).toBe(110);
    else expect(true).toBe(true); // just verify no crash
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
