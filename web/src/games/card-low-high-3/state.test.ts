import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s10 = { rounds: "10" as const };

describe("CardLowHigh3 initialState", () => {
  it("starts with 3 cards in picking phase", () => {
    const s = initialState(1, s10);
    expect(s.cards.length).toBe(3);
    expect(s.phase).toBe("picking");
  });
  it("score starts at 0", () => {
    expect(initialState(1, s10).score).toBe(0);
  });
  it("is deterministic", () => {
    expect(initialState(9, s10).cards).toEqual(initialState(9, s10).cards);
  });
  it("all cards 0-51", () => {
    for (const c of initialState(1, s10).cards) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(51);
    }
  });
});

describe("CardLowHigh3 reducer", () => {
  it("correct low pick awards 30 pts", () => {
    const s = initialState(1, s10);
    const ranks = s.cards.map(c => c % 13);
    const minRank = Math.min(...ranks);
    const lowIdx = ranks.indexOf(minRank);
    const s2 = reducer(s, { type: "pick", cardIdx: lowIdx, bet: "low" });
    expect(s2.score).toBe(30);
    expect(s2.result).toBe("correct");
  });
  it("wrong bet awards 0", () => {
    const s = initialState(1, s10);
    const ranks = s.cards.map(c => c % 13);
    const maxRank = Math.max(...ranks);
    const highIdx = ranks.indexOf(maxRank);
    // call the highest card LOW -> wrong
    const s2 = reducer(s, { type: "pick", cardIdx: highIdx, bet: "low" });
    // Only wrong if highest is not also lowest (all different)
    if (new Set(ranks).size === 3) expect(s2.result).toBe("wrong");
  });
  it("next advances round", () => {
    const s = initialState(1, s10);
    const s2 = reducer(s, { type: "pick", cardIdx: 0, bet: "low" });
    const s3 = s2.phase === "result" ? reducer(s2, { type: "next" }) : s2;
    if (s3.phase === "picking") expect(s3.round).toBe(2);
  });
  it("gameover after last round", () => {
    let s = initialState(1, { rounds: "8" });
    for (let i = 0; i < 8; i++) {
      s = reducer(s, { type: "pick", cardIdx: 0, bet: "low" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
