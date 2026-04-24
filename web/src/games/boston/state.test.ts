import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("boston initialState", () => {
  it("deals 13 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 13)).toBe(true);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("bidding");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

describe("boston bidding", () => {
  it("bidding moves to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 5 });
    expect(s2.phase).toBe("playing");
    expect(s2.bid).toBe(5);
  });

  it("bid is clamped to 1-13", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 0 });
    expect(s2.bid).toBe(1);
    const s3 = reducer(s, { type: "bid", amount: 14 });
    expect(s3.bid).toBe(13);
  });
});

describe("boston tricks", () => {
  it("legalPlays returns all 13 when leading", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "bid", amount: 6 });
    expect(legalPlays(s1, 0).length).toBe(13);
  });

  it("completes full game", () => {
    let s = initialState(5, DEF);
    s = reducer(s, { type: "bid", amount: 4 });
    let iter = 0;
    while (s.phase === "playing" && iter < 150) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("isTerminal null during play", () => {
    const s = initialState(1, DEF);
    expect(isTerminal(s)).toBeNull();
  });
});
