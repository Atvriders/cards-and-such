import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("ulti initialState", () => {
  it("deals 10 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 10)).toBe(true);
  });

  it("has 3 hands", () => {
    const s = initialState(42, DEF);
    expect(s.hands.length).toBe(3);
  });

  it("starts in bidding phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("bidding");
  });

  it("is deterministic", () => {
    const s1 = initialState(22, DEF);
    const s2 = initialState(22, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });
});

describe("ulti bidding", () => {
  it("bid transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 5 });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("bid is recorded", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 6 });
    expect(s2.bid).toBeGreaterThanOrEqual(6);
  });
});

describe("ulti legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 5 });
    if (s2.phase !== "playing" || s2.turn !== 0) return;
    expect(legalPlays(s2, 0).length).toBe(10);
  });
});

describe("ulti full game", () => {
  it("completes a round", () => {
    let s = initialState(4, DEF);
    s = reducer(s, { type: "bid", amount: 5 });
    let iter = 0;
    while (s.phase === "playing" && iter < 100) {
      if (s.turn === 0) {
        const legal = legalPlays(s, 0);
        if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
