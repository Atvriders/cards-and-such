import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalPlays } from "./state.js";

const DEF = { botDifficulty: "hard" as const };

describe("forty-fives initialState", () => {
  it("deals 5 cards to each player", () => {
    const s = initialState(42, DEF);
    expect(s.hands.every(h => h.length === 5)).toBe(true);
  });

  it("starts in playing phase", () => {
    const s = initialState(42, DEF);
    expect(s.phase).toBe("playing");
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

describe("forty-fives legalPlays", () => {
  it("all cards legal when leading", () => {
    const s = initialState(42, DEF);
    expect(legalPlays(s, 0).length).toBe(5);
  });

  it("must follow led suit if possible", () => {
    const s = initialState(42, DEF);
    const hand = [
      { suit: "♠" as const, rank: 2 as const, id: "s2" },
      { suit: "♥" as const, rank: 3 as const, id: "h3" },
    ];
    const trick = [{ seat: 1, card: { suit: "♠" as const, rank: 9 as const, id: "s9" } }];
    const ms = { ...s, hands: [hand, [], [], []], currentTrick: trick, turn: 0, trumpSuit: "♦" as const };
    const legal = legalPlays(ms, 0);
    expect(legal.every(c => c.suit === "♠")).toBe(true);
  });
});

describe("forty-fives reducer", () => {
  it("playing a card advances the state", () => {
    const s = initialState(42, DEF);
    const card = s.hands[0]![0]!;
    const s2 = reducer(s, { type: "play", cardId: card.id });
    expect(["playing", "done"].includes(s2.phase)).toBe(true);
  });

  it("full game completes", () => {
    let s = initialState(3, DEF);
    let iter = 0;
    while (s.phase === "playing" && iter < 50) {
      const legal = legalPlays(s, 0);
      if (legal.length > 0) s = reducer(s, { type: "play", cardId: legal[0]!.id });
      iter++;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
