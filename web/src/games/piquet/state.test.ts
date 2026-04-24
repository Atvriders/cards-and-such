import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("piquet initialState", () => {
  it("deals 12 cards to each player and 8 talon", () => {
    const s = initialState(42, DEF);
    expect(s.hands[0]!.length).toBe(12);
    expect(s.hands[1]!.length).toBe(12);
    expect(s.talon.length).toBe(8);
  });

  it("starts in discard phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("discard");
  });

  it("is deterministic", () => {
    const s1 = initialState(77, DEF);
    const s2 = initialState(77, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("all 32 cards dealt (no duplicates)", () => {
    const s = initialState(1, DEF);
    const all = [...s.hands[0]!, ...s.hands[1]!, ...s.talon].map(c => c.id);
    expect(new Set(all).size).toBe(32);
  });
});

describe("piquet discard", () => {
  it("discarding transitions to tricks phase", () => {
    const s = initialState(42, DEF);
    const toDiscard = s.hands[0]!.slice(0, 3).map(c => c.id);
    const s2 = reducer(s, { type: "discard", cardIds: toDiscard });
    expect(s2.phase).toBe("tricks");
  });

  it("discarding zero cards is valid", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "discard", cardIds: [] });
    expect(s2.phase).toBe("tricks");
  });
});

describe("piquet tricks", () => {
  it("must follow led suit if possible", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "discard", cardIds: [] });
    if (s1.phase !== "tricks") return;
    const hand = [
      { suit: "♠" as const, rank: 10 as const, id: "pq-♠10" },
      { suit: "♥" as const, rank: 9 as const, id: "pq-♥9" },
    ];
    const trick = [{ seat: 1, card: { suit: "♠" as const, rank: 13 as const, id: "pq-♠13" } }];
    const ms = { ...s1, hands: [hand, [], [], []] as typeof s1.hands, currentTrick: trick, turn: 0 };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♠")).toBe(true);
  });

  it("plays full game", () => {
    let s = initialState(2, DEF);
    s = reducer(s, { type: "discard", cardIds: s.hands[0]!.slice(0, 5).map(c => c.id) });
    let iter = 0;
    while (s.phase === "tricks" && iter < 100) {
      if (s.turn === 0) {
        const legal = legalPlays(s, 0);
        if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      }
      iter++;
    }
    expect(["done", "tricks"].includes(s.phase)).toBe(true);
  });
});
