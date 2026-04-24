import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("solo-whist initialState", () => {
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

  it("trump suit is valid", () => {
    const s = initialState(1, DEF);
    expect(["♠", "♥", "♦", "♣"]).toContain(s.trumpSuit);
  });
});

describe("solo-whist bidding", () => {
  it("bidding solo moves to playing", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", bid: "solo" });
    expect(s2.phase).toBe("playing");
    expect(s2.playerBid).toBe("solo");
  });

  it("passing moves to done", () => {
    const s = initialState(42, DEF);
    const s2 = reducer(s, { type: "bid", bid: "pass" });
    expect(s2.phase).toBe("done");
  });
});

describe("solo-whist tricks", () => {
  it("legalPlays returns cards when leading", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "bid", bid: "solo" });
    expect(legalPlays(s1, 0).length).toBe(13);
  });

  it("must follow led suit if possible", () => {
    const s0 = initialState(42, DEF);
    const s1 = reducer(s0, { type: "bid", bid: "solo" });
    const hand = [
      { suit: "♠" as const, rank: 5 as const, id: "s5" },
      { suit: "♥" as const, rank: 4 as const, id: "h4" },
    ];
    const trick = [{ seat: 1, card: { suit: "♠" as const, rank: 9 as const, id: "s9" } }];
    const ms = { ...s1, hands: [hand, [], [], []] as typeof s1.hands, currentTrick: trick, turn: 0 };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♠")).toBe(true);
  });

  it("completes a full game (solo)", () => {
    let s = initialState(4, DEF);
    s = reducer(s, { type: "bid", bid: "solo" });
    let iter = 0;
    while (s.phase === "playing" && iter < 150) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
