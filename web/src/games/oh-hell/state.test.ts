import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("oh-hell initialState", () => {
  it("deals 7 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 7)).toBe(true);
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

  it("trump card is defined", () => {
    const s = initialState(1, DEF);
    expect(s.trumpCard).toBeDefined();
    expect(s.trumpSuit).toBeTruthy();
  });
});

describe("oh-hell bidding", () => {
  it("bidding transitions to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 2 });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("bids are recorded", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", amount: 3 });
    expect(s2.bids[0]).toBe(3);
  });
});

describe("oh-hell legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(7);
  });

  it("must follow led suit if possible", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "bid", amount: 1 });
    if (s1.phase !== "playing") return;
    const hand = [
      { suit: "♥" as const, rank: 5 as const, id: "h5" },
      { suit: "♦" as const, rank: 3 as const, id: "d3" },
    ];
    const trick = [{ seat: 1, card: { suit: "♥" as const, rank: 9 as const, id: "h9" } }];
    const ms = { ...s1, hands: [hand, [], [], []], currentTrick: trick, turn: 0 };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♥")).toBe(true);
  });
});

describe("oh-hell full game", () => {
  it("completes and produces isTerminal", () => {
    let s = initialState(9, DEF);
    s = reducer(s, { type: "bid", amount: 1 });
    let iter = 0;
    while (s.phase === "playing" && iter < 100) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
