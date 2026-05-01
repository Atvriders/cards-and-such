import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS, HAND_SIZE, totalScore } from "./state.js";

const S = { dummy: false };

describe("DominionDeck", () => {
  it("starts in play phase, hand of HAND_SIZE", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("play");
    expect(s.hand.length).toBe(HAND_SIZE);
    expect(s.turn).toBe(1);
  });
  it("playAll converts hand to coin", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "playAll" });
    expect(s2.phase).toBe("buy");
    expect(s2.coin).toBeGreaterThanOrEqual(0);
    expect(s2.hand.length).toBe(0);
  });
  it("buy deducts coin, gains VP for victory cards", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "playAll" });
    if (s.coin >= 2) {
      const beforeVp = s.vpGained;
      const beforeCoin = s.coin;
      const s2 = reducer(s, { type: "buy", cardId: "estate" });
      expect(s2.coin).toBe(beforeCoin - 2);
      expect(s2.vpGained).toBe(beforeVp + 1);
      expect(s2.bought).toBe("estate");
    }
  });
  it("cannot buy when insufficient coin", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "playAll" });
    const before = s;
    const after = reducer(s, { type: "buy", cardId: "province" });
    if (s.coin < 8) expect(after).toBe(before);
  });
  it("game ends after TOTAL_TURNS", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_TURNS; i++) {
      s = reducer(s, { type: "playAll" });
      s = reducer(s, { type: "endTurn" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(totalScore(s)).toBeGreaterThanOrEqual(3);
  });
  it("score is non-negative across multiple seeds", () => {
    for (const seed of [1, 42, 999]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_TURNS; i++) {
        s = reducer(s, { type: "playAll" });
        if (s.coin >= 5) s = reducer(s, { type: "buy", cardId: "duchy" });
        s = reducer(s, { type: "endTurn" });
      }
      expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
    }
  });
});
