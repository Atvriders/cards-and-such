import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, klaverjasDeck, cardValue, isTrump, trickWinner } from "./state.js";

describe("Klaverjas - deck", () => {
  it("has exactly 32 cards", () => {
    expect(klaverjasDeck()).toHaveLength(32);
  });

  it("contains ranks 7-A only", () => {
    const ranks = new Set(klaverjasDeck().map(c => c.rank));
    for (const r of [2, 3, 4, 5, 6]) expect(ranks.has(r as never)).toBe(false);
  });
});

describe("Klaverjas - cardValue", () => {
  it("trump Jack=20, trump 9=14", () => {
    expect(cardValue(11, true)).toBe(20);
    expect(cardValue(9, true)).toBe(14);
  });

  it("off-suit Jack=2, off-suit 9=0", () => {
    expect(cardValue(11, false)).toBe(2);
    expect(cardValue(9, false)).toBe(0);
  });

  it("Ace=11 in both trump and off-suit", () => {
    expect(cardValue(1, true)).toBe(11);
    expect(cardValue(1, false)).toBe(11);
  });
});

describe("Klaverjas - trickWinner", () => {
  it("trump beats off-suit", () => {
    const trick = [
      { seat: 0, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
      { seat: 1, card: { suit: "♥" as const, rank: 7 as const, id: "b" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(1); // trump 7 beats off-suit Ace
  });

  it("trump Jack (Jass) beats trump 9 (Menel)", () => {
    const trick = [
      { seat: 0, card: { suit: "♦" as const, rank: 11 as const, id: "j" } },
      { seat: 1, card: { suit: "♦" as const, rank: 9 as const, id: "n" } },
    ];
    expect(trickWinner(trick, "♦")).toBe(0);
  });

  it("led suit wins over other non-trump suits", () => {
    const trick = [
      { seat: 0, card: { suit: "♠" as const, rank: 10 as const, id: "t" } },
      { seat: 1, card: { suit: "♣" as const, rank: 1 as const, id: "a" } },
    ];
    expect(trickWinner(trick, "♥")).toBe(0); // ♠ led, ♣ doesn't follow
  });
});

describe("Klaverjas - initialState", () => {
  it("deals 8 cards to each of 4 players", () => {
    const state = initialState(42);
    for (let i = 0; i < 4; i++) {
      expect(state.hands[i]).toHaveLength(8);
    }
  });

  it("starts in playing phase", () => {
    const state = initialState(42);
    expect(state.phase).toBe("playing");
  });

  it("trump suit is defined", () => {
    const state = initialState(42);
    expect(["♣", "♠", "♥", "♦"]).toContain(state.trumpSuit);
  });

  it("total cards = 32", () => {
    const state = initialState(99);
    const total = state.hands.reduce((s, h) => s + h.length, 0);
    expect(total).toBe(32);
  });
});

describe("Klaverjas - gameplay", () => {
  it("playing a card removes it from hand", () => {
    const state = initialState(1234);
    const cardId = state.hands[0]![0]!.id;
    const next = reducer(state, { type: "play", cardId });
    expect(next.hands[0]!.find(c => c.id === cardId)).toBeUndefined();
  });

  it("invalid card does nothing", () => {
    const state = initialState(42);
    const next = reducer(state, { type: "play", cardId: "xx-none" });
    expect(next).toEqual(state);
  });

  it("game eventually ends", () => {
    let state = initialState(7777);
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
    expect(state.phase).toBe("done");
  });

  it("isTerminal returns non-null after game ends", () => {
    let state = initialState(55);
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
    expect(isTerminal(state)).not.toBeNull();
  });
});
