import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TripleFreecellState, TripleFreecellSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: TripleFreecellSettings = {};

describe("Triple FreeCell initialState", () => {
  it("has 156 cards across all piles", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(156);
  });

  it("has 13 cascades, each with 12 face-up cards", () => {
    const s = initialState(7, S);
    for (let i = 1; i <= 13; i++) {
      const p = s.piles.find((pp) => pp.id === `c${i}`)!;
      expect(p.cards.length).toBe(12);
      expect(p.faceUpCount).toBe(12);
    }
  });

  it("8 free cells (more than classic FreeCell's 4)", () => {
    const s = initialState(1, S);
    expect(s.piles.filter((p) => p.kind === "freecell").length).toBe(8);
  });

  it("12 foundations (3 decks × 4 suits)", () => {
    const s = initialState(1, S);
    expect(s.piles.filter((p) => p.kind === "foundation").length).toBe(12);
  });
});

describe("Triple FreeCell rules", () => {
  it("rejects illegal moves", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "f1", count: 1 });
    // Most random top cards aren't aces, so this should be no-op
    if (s.piles.find((p) => p.id === "c1")!.cards.slice(-1)[0]!.rank !== 1) {
      expect(next).toBe(s);
    }
  });

  it("isTerminal needs all 156 on foundations", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 12; fi++) {
      const suit = SUITS[fi % 4]! as Suit;
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit, rank: r as Rank, id: `tfc${idx++}` })),
      });
    }
    for (let i = 1; i <= 13; i++) piles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    for (let i = 1; i <= 8; i++) piles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    const won: TripleFreecellState = { piles, score: 156, movesMade: 250, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(156);
  });
});
