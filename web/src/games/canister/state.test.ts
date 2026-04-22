import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canisterRuleset } from "./state.js";
import type { CanisterState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Canister initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("8 columns: first 4 have 7 cards, last 4 have 6 cards", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `t${i}`)!.cards.length).toBe(7);
    }
    for (let i = 5; i <= 8; i++) {
      expect(s.piles.find((p) => p.id === `t${i}`)!.cards.length).toBe(6);
    }
  });

  it("all tableau cards are face-up", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.faceUpCount).toBe(t.cards.length);
    }
  });

  it("4 empty foundations, no stock", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
    expect(s.piles.find((p) => p.id === "stock")).toBeUndefined();
  });
});

describe("Canister ruleset", () => {
  it("allows alternating-color descending move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 8 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♥", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, canisterRuleset)).toBe(true);
  });

  it("rejects same-color tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 8 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♣", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, canisterRuleset)).toBe(false);
  });

  it("allows moving sequence to empty column", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      {
        id: "t2", kind: "tableau",
        cards: [{ id: "c1", suit: "♠", rank: 8 }, { id: "c2", suit: "♥", rank: 7 }],
        faceUpCount: 2,
      },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 2 }, canisterRuleset)).toBe(true);
  });
});

describe("Canister reducer", () => {
  it("legal move increments movesMade", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 8 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♥", rank: 7 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
      ...Array.from({ length: 6 }, (_, i) => ({ id: `t${i+3}`, kind: "tableau" as const, cards: [], faceUpCount: 0 })),
    ];
    const s: CanisterState = { piles, score: 0, movesMade: 0, won: false, settings };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next.movesMade).toBe(1);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
  });

  it("illegal move returns same state reference", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });

  it("+10 score when moving to foundation", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "a1", suit: "♠", rank: 1 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
      ...Array.from({ length: 7 }, (_, i) => ({ id: `t${i+2}`, kind: "tableau" as const, cards: [], faceUpCount: 0 })),
    ];
    const s: CanisterState = { piles, score: 0, movesMade: 0, won: false, settings };
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "f1", count: 1 });
    expect(next.score).toBe(10);
  });
});

describe("Canister isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when 52 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${idx++}` })),
      });
    }
    for (let i = 1; i <= 8; i++) wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    const wonState: CanisterState = { piles: wonPiles, score: 520, movesMade: 150, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 520 });
  });
});
