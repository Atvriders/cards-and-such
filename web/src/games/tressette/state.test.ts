import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, tressetteDeck, tressetteStrength, cardPoints, trickWinner } from "./state.js";

describe("Tressette - deck", () => {
  it("has exactly 40 cards", () => {
    expect(tressetteDeck()).toHaveLength(40);
  });

  it("contains no ranks 8, 9, 10", () => {
    const ranks = new Set(tressetteDeck().map(c => c.rank));
    for (const r of [8, 9, 10]) expect(ranks.has(r as never)).toBe(false);
  });

  it("has 4 suits with 10 cards each", () => {
    const deck = tressetteDeck();
    for (const suit of ["♣", "♠", "♥", "♦"]) {
      expect(deck.filter(c => c.suit === suit)).toHaveLength(10);
    }
  });
});

describe("Tressette - card strength", () => {
  it("3 beats 2 beats Ace", () => {
    expect(tressetteStrength(3)).toBeGreaterThan(tressetteStrength(2));
    expect(tressetteStrength(2)).toBeGreaterThan(tressetteStrength(1));
  });

  it("Ace beats King", () => {
    expect(tressetteStrength(1)).toBeGreaterThan(tressetteStrength(13));
  });

  it("4 is lowest", () => {
    const allRanks = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13] as const;
    for (const r of allRanks) {
      if (r !== 4) expect(tressetteStrength(r)).toBeGreaterThan(tressetteStrength(4));
    }
  });
});

describe("Tressette - cardPoints", () => {
  it("A, 2, 3 each score 1", () => {
    expect(cardPoints(1)).toBe(1);
    expect(cardPoints(2)).toBe(1);
    expect(cardPoints(3)).toBe(1);
  });

  it("K, Q, J, 4-7 score 0 individually", () => {
    for (const r of [13, 12, 11, 4, 5, 6, 7] as const) {
      expect(cardPoints(r)).toBe(0);
    }
  });
});

describe("Tressette - trickWinner", () => {
  it("3 beats Ace of same suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♣" as const, rank: 3 as const, id: "b" } },
    ];
    expect(trickWinner(trick)).toBe(1);
  });

  it("off-suit does not beat led suit even if higher rank", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 4 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 3 as const, id: "b" } },
    ];
    expect(trickWinner(trick)).toBe(0);
  });

  it("highest led-suit card wins in 4-card trick", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 5 as const, id: "a" } },
      { seat: 1, card: { suit: "♦" as const, rank: 2 as const, id: "b" } },
      { seat: 2, card: { suit: "♦" as const, rank: 7 as const, id: "c" } },
      { seat: 3, card: { suit: "♦" as const, rank: 3 as const, id: "d" } },
    ];
    expect(trickWinner(trick)).toBe(3); // 3 is highest
  });
});

describe("Tressette - initialState", () => {
  it("deals 10 cards to each of 4 players", () => {
    const state = initialState(42);
    for (let i = 0; i < 4; i++) {
      expect(state.hands[i]).toHaveLength(10);
    }
  });

  it("starts in playing phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
  });

  it("total cards = 40", () => {
    const state = initialState(99);
    const total = state.hands.reduce((s, h) => s + h.length, 0);
    expect(total).toBe(40);
  });
});

describe("Tressette - gameplay", () => {
  it("playing a card removes it from hand", () => {
    const state = initialState(1234);
    const cardId = state.hands[0]![0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.hands[0]!.find(c => c.id === cardId)).toBeUndefined();
  });

  it("game ends after all tricks", () => {
    let state = initialState(7777);
    let iter = 0;
    while (state.phase !== "done" && iter < 200) {
      const hand = state.hands[0]!;
      if (hand.length === 0) break;
      // Try each card until one is accepted
      let played = false;
      for (const card of hand) {
        const next = reducer(state, { type: "play", cardId: card.id });
        if (next !== state) { state = next; played = true; break; }
      }
      if (!played) break;
      iter++;
    }
    expect(state.phase).toBe("done");
  });

  it("isTerminal returns score in 0-100 range", () => {
    let state = initialState(5678);
    let iter = 0;
    while (state.phase !== "done" && iter < 200) {
      const hand = state.hands[0]!;
      if (hand.length === 0) break;
      let played = false;
      for (const card of hand) {
        const next = reducer(state, { type: "play", cardId: card.id });
        if (next !== state) { state = next; played = true; break; }
      }
      if (!played) break;
      iter++;
    }
    const term = isTerminal(state);
    expect(term).not.toBeNull();
    expect(term!.score).toBeGreaterThanOrEqual(0);
    expect(term!.score).toBeLessThanOrEqual(100);
  });
});
