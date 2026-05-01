import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_TURNS, HAND_SIZE, totalScore } from "./state.js";
const S = { dummy: false };
describe("Ascension", () => {
  it("starts in play with hand of HAND_SIZE", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("play");
    expect(s.hand.length).toBe(HAND_SIZE);
  });
  it("playAll moves to buy", () => {
    const s = reducer(initialState(1, S), { type: "playAll" });
    expect(s.phase).toBe("buy");
    expect(s.coin).toBeGreaterThanOrEqual(0);
  });
  it("buying a victory1 (cost 2) should normally succeed", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "playAll" });
    if (s.coin >= 2) {
      const s2 = reducer(s, { type: "buy", cardId: "victory1" });
      expect(s2.bought).toBe("victory1");
      expect(s2.coin).toBe(s.coin - 2);
      expect(s2.vpGained).toBe(1);
    }
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
  it("score non-negative across seeds", () => {
    for (const seed of [1, 99, 1234]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_TURNS; i++) {
        s = reducer(s, { type: "playAll" });
        if (s.coin >= 5) s = reducer(s, { type: "buy", cardId: "victory2" });
        s = reducer(s, { type: "endTurn" });
      }
      expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
    }
  });
});
