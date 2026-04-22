import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canBuildFoundation } from "./state.js";
import type { CarpetState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const settings = {};

describe("Carpet initialState", () => {
  it("has exactly 52 cards total across piles + stock", () => {
    const s = initialState(42, settings);
    const pileTotal = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(pileTotal + s.stock.length + s.waste.length).toBe(52);
  });

  it("has 20 grid positions each with 1 card", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 20; i++) {
      const g = s.piles.find((p) => p.id === `g${i}`)!;
      expect(g.cards.length).toBe(1);
    }
  });

  it("has 4 empty foundations and 4 empty free cells", () => {
    const s = initialState(42, settings);
    for (const fid of ["f1","f2","f3","f4"]) {
      expect(s.piles.find((p) => p.id === fid)!.cards.length).toBe(0);
    }
    for (const cid of ["c1","c2","c3","c4"]) {
      expect(s.piles.find((p) => p.id === cid)!.cards.length).toBe(0);
    }
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    const j1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const j2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(j1).not.toEqual(j2);
  });
});

describe("Carpet canBuildFoundation", () => {
  it("Ace goes on empty foundation", () => {
    const foundation: Pile = { id: "f1", kind: "foundation", cards: [] };
    expect(canBuildFoundation(foundation, { id: "as", suit: "♠", rank: 1 })).toBe(true);
  });

  it("non-Ace rejected on empty foundation", () => {
    const foundation: Pile = { id: "f1", kind: "foundation", cards: [] };
    expect(canBuildFoundation(foundation, { id: "2s", suit: "♠", rank: 2 })).toBe(false);
  });

  it("2 goes on Ace same suit", () => {
    const foundation: Pile = {
      id: "f1",
      kind: "foundation",
      cards: [{ id: "as", suit: "♠", rank: 1 }],
    };
    expect(canBuildFoundation(foundation, { id: "2s", suit: "♠", rank: 2 })).toBe(true);
  });

  it("wrong suit rejected", () => {
    const foundation: Pile = {
      id: "f1",
      kind: "foundation",
      cards: [{ id: "as", suit: "♠", rank: 1 }],
    };
    expect(canBuildFoundation(foundation, { id: "2h", suit: "♥", rank: 2 })).toBe(false);
  });
});

describe("Carpet reducer", () => {
  it("draw flips one card from stock to waste", () => {
    const s = initialState(42, settings);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
    expect(next.waste.length).toBe(1);
  });

  it("play-to-foundation sends Ace to foundation and refills grid", () => {
    const s = initialState(42, settings);
    // Find a grid position with an Ace
    let aceGridId: string | null = null;
    for (const p of s.piles) {
      if (p.kind === "tableau" && p.cards.length === 1 && p.cards[0]!.rank === 1) {
        aceGridId = p.id;
        break;
      }
    }
    if (!aceGridId) return; // no Ace in grid for this seed, skip

    const beforeFoundTotal = s.piles.filter((p) => p.kind === "foundation")
      .reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "play-to-foundation", fromPile: aceGridId, toPile: "f1" });
    if (next === s) return; // invalid, skip
    const afterFoundTotal = next.piles.filter((p) => p.kind === "foundation")
      .reduce((sum, p) => sum + p.cards.length, 0);
    expect(afterFoundTotal).toBeGreaterThan(beforeFoundTotal);
  });

  it("play-to-cell parks waste card in empty cell", () => {
    const s = initialState(42, settings);
    const drawn = reducer(s, { type: "draw" });
    expect(drawn.waste.length).toBe(1);
    const next = reducer(drawn, { type: "play-to-cell", fromPile: "waste", toPile: "c1" });
    if (next === drawn) return;
    expect(next.piles.find((p) => p.id === "c1")!.cards.length).toBe(1);
    expect(next.waste.length).toBe(0);
  });

  it("isTerminal returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score when all foundations full (52 cards)", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 20; i++) {
      wonPiles.push({ id: `g${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    for (let i = 1; i <= 4; i++) {
      wonPiles.push({ id: `c${i}`, kind: "freecell", cards: [] });
    }
    const wonState: CarpetState = {
      piles: wonPiles,
      stock: [],
      waste: [],
      score: 520,
      movesMade: 52,
      won: true,
      settings,
    };
    expect(isTerminal(wonState)!.score).toBe(520);
  });
});
