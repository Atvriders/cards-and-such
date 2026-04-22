import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, yukonCellsRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank, Card } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("YukonCells initialState", () => {
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

  it("has 4 empty free cells", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const fc = s.piles.find((p) => p.id === `fc${i}`)!;
      expect(fc.cards.length).toBe(0);
    }
  });

  it("has 4 empty foundations", () => {
    const s = initialState(1, settings);
    for (let fi = 1; fi <= 4; fi++) {
      expect(s.piles.find((p) => p.id === `f${fi}`)!.cards.length).toBe(0);
    }
  });
});

describe("YukonCells ruleset", () => {
  it("freecell accepts single card to empty cell", () => {
    const target: Pile = { id: "fc1", kind: "freecell", cards: [] };
    const moving: Card[] = [{ id: "x1", suit: "♠", rank: 7 }];
    expect(yukonCellsRuleset.canStack(target, moving)).toBe(true);
  });

  it("freecell rejects when occupied", () => {
    const target: Pile = {
      id: "fc1", kind: "freecell",
      cards: [{ id: "x0", suit: "♣", rank: 3 }],
    };
    const moving: Card[] = [{ id: "x1", suit: "♠", rank: 7 }];
    expect(yukonCellsRuleset.canStack(target, moving)).toBe(false);
  });

  it("any face-up card can be picked up (Yukon rule)", () => {
    const pile: Pile = {
      id: "t1", kind: "tableau",
      cards: [
        { id: "c1", suit: "♠", rank: 8 },
        { id: "c2", suit: "♥", rank: 3 }, // not a valid sequence
        { id: "c3", suit: "♣", rank: 9 },
      ],
      faceUpCount: 3,
    };
    expect(yukonCellsRuleset.canPickUp(pile, 3)).toBe(true);
  });
});

describe("YukonCells reducer", () => {
  it("legal tableau move updates state", () => {
    const s = initialState(42, settings);
    let moved = false;
    outer: for (const fromId of ["t1","t2","t3","t4","t5","t6","t7"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7"]) {
        if (fromId === toId) continue;
        for (let count = 1; count <= 5; count++) {
          if (canMove(s.piles, { fromPile: fromId, toPile: toId, count }, yukonCellsRuleset)) {
            const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count });
            expect(next.movesMade).toBe(1);
            moved = true;
            break outer;
          }
        }
      }
    }
    void moved;
  });

  it("illegal move (count 0) returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("YukonCells isTerminal", () => {
  it("returns null initially", () => {
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
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    for (let i = 1; i <= 4; i++) {
      wonPiles.push({ id: `fc${i}`, kind: "freecell", cards: [] });
    }
    const wonState = { piles: wonPiles, score: 520, movesMade: 80, won: true, settings };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
