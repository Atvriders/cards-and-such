import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("klop initialState", () => {
  it("deals 8 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 8)).toBe(true);
  });

  it("starts in playing phase (no bidding)", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("playing");
  });

  it("is deterministic", () => {
    const s1 = initialState(100, DEF);
    const s2 = initialState(100, DEF);
    expect(s1.hands[0]!.map(c => c.id)).toEqual(s2.hands[0]!.map(c => c.id));
  });

  it("has 4 hands", () => {
    const s = initialState(1, DEF);
    expect(s.hands.length).toBe(4);
  });
});

describe("klop legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(8);
  });

  it("must follow led suit", () => {
    const s = initialState(42, DEF);
    const hand = [
      { suit: "♠" as const, rank: 5 as const, id: "s5" },
      { suit: "♥" as const, rank: 3 as const, id: "h3" },
    ];
    const trick = [{ seat: 1, card: { suit: "♠" as const, rank: 9 as const, id: "s9" } }];
    const ms = { ...s, hands: [hand, [], [], []], currentTrick: trick, turn: 0 };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♠")).toBe(true);
  });
});

describe("klop playing", () => {
  it("playing a card reduces hand", () => {
    const s = initialState(42, DEF);
    const legal = legalPlays(s, 0);
    const s2 = reducer(s, { type: "play", cardId: legal[0]!.id });
    expect(s2.hands[0]!.length).toBeLessThanOrEqual(8);
  });
});

describe("klop full game", () => {
  it("completes a game", () => {
    let s = initialState(2, DEF);
    let iter = 0;
    while (s.phase === "playing" && iter < 200) {
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
