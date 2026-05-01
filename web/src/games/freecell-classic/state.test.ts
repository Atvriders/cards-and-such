import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FreecellClassicState, FreecellClassicSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const S: FreecellClassicSettings = {};

describe("FreeCell Classic initialState", () => {
  it("has 52 cards across all piles", () => {
    expect(initialState(42, S).piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("8 cascades — first 4 with 7 cards, last 4 with 6", () => {
    const s = initialState(7, S);
    for (let i = 0; i < 8; i++) {
      const p = s.piles.find((pp) => pp.id === `c${i + 1}`)!;
      expect(p.cards.length).toBe(i < 4 ? 7 : 6);
      expect(p.faceUpCount).toBe(i < 4 ? 7 : 6);
    }
  });

  it("4 free cells start empty", () => {
    const s = initialState(1, S);
    for (let i = 1; i <= 4; i++) {
      const p = s.piles.find((pp) => pp.id === `fc${i}`)!;
      expect(p.cards.length).toBe(0);
      expect(p.kind).toBe("freecell");
    }
  });

  it("4 foundations start empty", () => {
    const s = initialState(1, S);
    expect(s.piles.filter((p) => p.kind === "foundation").length).toBe(4);
  });
});

describe("FreeCell Classic isTerminal", () => {
  it("returns null at start", () => {
    expect(isTerminal(initialState(42, S))).toBeNull();
  });

  it("returns score when all 52 on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `fcc${idx++}` })),
      });
    }
    for (let i = 1; i <= 8; i++) piles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    for (let i = 1; i <= 4; i++) piles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    const won: FreecellClassicState = { piles, score: 52, movesMade: 70, won: true, settings: S };
    expect(isTerminal(won)!.score).toBe(52);
  });
});
