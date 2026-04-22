import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, whiteheadRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Whitehead initialState", () => {
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

  it("all tableau cards are face-up", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 7; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.faceUpCount).toBe(t.cards.length);
    }
  });

  it("stock has 24 cards", () => {
    const s = initialState(1, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(24);
  });
});

describe("Whitehead ruleset", () => {
  it("same-color descending tableau stack is valid (red on red)", () => {
    const target: Pile = {
      id: "t1", kind: "tableau",
      cards: [{ id: "a1", suit: "♥", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "a2", suit: "♦", rank: 8 }];
    expect(whiteheadRuleset.canStack(target, moving)).toBe(true);
  });

  it("alternating-color stack is invalid (red on black not allowed)", () => {
    const target: Pile = {
      id: "t1", kind: "tableau",
      cards: [{ id: "a1", suit: "♠", rank: 9 }],
      faceUpCount: 1,
    };
    const moving: Card[] = [{ id: "a2", suit: "♦", rank: 8 }];
    expect(whiteheadRuleset.canStack(target, moving)).toBe(false);
  });

  it("same-suit group can be picked up together", () => {
    const pile: Pile = {
      id: "t1", kind: "tableau",
      cards: [
        { id: "c1", suit: "♠", rank: 7 },
        { id: "c2", suit: "♠", rank: 6 },
        { id: "c3", suit: "♠", rank: 5 },
      ],
      faceUpCount: 3,
    };
    expect(whiteheadRuleset.canPickUp(pile, 3)).toBe(true);
  });

  it("mixed-suit group cannot be picked up", () => {
    const pile: Pile = {
      id: "t1", kind: "tableau",
      cards: [
        { id: "c1", suit: "♠", rank: 7 },
        { id: "c2", suit: "♥", rank: 6 }, // different suit
      ],
      faceUpCount: 2,
    };
    expect(whiteheadRuleset.canPickUp(pile, 2)).toBe(false);
  });
});

describe("Whitehead reducer", () => {
  it("draw moves card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(wasteAfter).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("illegal move (count 0) returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("legal tableau move works if any exists", () => {
    const s = initialState(42, settings);
    let moved = false;
    outer: for (const fromId of ["t1","t2","t3","t4","t5","t6","t7"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7"]) {
        if (fromId === toId) continue;
        if (canMove(s.piles, { fromPile: fromId, toPile: toId, count: 1 }, whiteheadRuleset)) {
          const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count: 1 });
          expect(next.movesMade).toBe(1);
          moved = true;
          break outer;
        }
      }
    }
    void moved;
  });
});

describe("Whitehead isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`, kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });
    const wonState = { piles: wonPiles, score: 520, movesMade: 80, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
