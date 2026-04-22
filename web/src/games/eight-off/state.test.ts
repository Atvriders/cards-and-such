import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, eightOffRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("EightOff initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("has 8 cascades each with 6 cards and 4 cells filled", () => {
    const s = initialState(1, settings);
    let cascadeTotal = 0;
    for (let i = 1; i <= 8; i++) {
      const c = s.piles.find((p) => p.id === `c${i}`)!;
      expect(c.cards.length).toBe(6);
      cascadeTotal += c.cards.length;
    }
    expect(cascadeTotal).toBe(48);
    let filledCells = 0;
    for (let i = 1; i <= 8; i++) {
      const fc = s.piles.find((p) => p.id === `fc${i}`)!;
      if (fc.cards.length > 0) filledCells++;
    }
    expect(filledCells).toBe(4);
  });

  it("4 foundations start empty", () => {
    const s = initialState(1, settings);
    for (let fi = 1; fi <= 4; fi++) {
      const f = s.piles.find((p) => p.id === `f${fi}`)!;
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("EightOff ruleset", () => {
  it("same-suit descending tableau stack is valid", () => {
    const target: Pile = {
      id: "c1", kind: "tableau",
      cards: [{ id: "c1", suit: "♣", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "c2", suit: "♣", rank: 8 }];
    expect(eightOffRuleset.canStack(target, moving)).toBe(true);
  });

  it("cross-suit tableau stack is invalid", () => {
    const target: Pile = {
      id: "c1", kind: "tableau",
      cards: [{ id: "c1", suit: "♣", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "c2", suit: "♥", rank: 8 }];
    expect(eightOffRuleset.canStack(target, moving)).toBe(false);
  });

  it("freecell accepts single card into empty cell", () => {
    const target: Pile = { id: "fc1", kind: "freecell", cards: [] };
    const moving: Card[] = [{ id: "c2", suit: "♥", rank: 5 }];
    expect(eightOffRuleset.canStack(target, moving)).toBe(true);
  });

  it("freecell rejects multi-card move", () => {
    const target: Pile = { id: "fc1", kind: "freecell", cards: [] };
    const moving: Card[] = [
      { id: "c2", suit: "♥", rank: 5 },
      { id: "c3", suit: "♥", rank: 4 },
    ];
    expect(eightOffRuleset.canStack(target, moving)).toBe(false);
  });
});

describe("EightOff reducer", () => {
  it("legal move to freecell works", () => {
    const s = initialState(42, settings);
    // Find an empty freecell
    const emptyCell = s.piles.find((p) => p.kind === "freecell" && p.cards.length === 0);
    if (!emptyCell) return; // all cells pre-filled — skip
    // Try moving top card of first cascade to empty cell
    const move = { fromPile: "c1", toPile: emptyCell.id, count: 1 };
    if (canMove(s.piles, move, eightOffRuleset)) {
      const next = reducer(s, { type: "move", ...move });
      expect(next.movesMade).toBe(1);
      expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
    }
  });

  it("illegal move (count 0) returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("EightOff isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all foundations have 13 cards", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`, kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 8; i++) {
      wonPiles.push({ id: `c${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
      wonPiles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    }
    const wonState = { piles: wonPiles, score: 520, movesMade: 80, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
