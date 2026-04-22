import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bakersDozRuleset } from "./state.js";
import type { BakersDozenState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("BakersDozen initialState", () => {
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

  it("has 13 tableau columns of 4 cards each and 4 empty foundations", () => {
    const s = initialState(5, settings);
    const tabs = s.piles.filter((p) => p.kind === "tableau");
    expect(tabs.length).toBe(13);
    for (const t of tabs) expect(t.cards.length).toBe(4);
    const founds = s.piles.filter((p) => p.kind === "foundation");
    expect(founds.length).toBe(4);
    for (const f of founds) expect(f.cards.length).toBe(0);
  });

  it("Kings are always at the bottom of their column", () => {
    // Run multiple seeds to verify
    for (const seed of [1, 2, 3, 10, 42]) {
      const s = initialState(seed, settings);
      for (const pile of s.piles.filter((p) => p.kind === "tableau")) {
        for (let i = 1; i < pile.cards.length; i++) {
          // Cards above index 0 must not be Kings if a king is present, OR kings can only be at index 0
          if (pile.cards[i]!.rank === 13) {
            // King at non-bottom position — all below must also be kings
            for (let j = 0; j < i; j++) {
              expect(pile.cards[j]!.rank).toBe(13);
            }
          }
        }
      }
    }
  });
});

describe("BakersDozen ruleset", () => {
  it("allows placing any suit descending on tableau", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "c1", suit: "♠", rank: 8 }],
      faceUpCount: 1,
    };
    // Different suit, one lower
    expect(bakersDozRuleset.canStack(target, [{ id: "c2", suit: "♥", rank: 7 }])).toBe(true);
    expect(bakersDozRuleset.canStack(target, [{ id: "c2", suit: "♦", rank: 7 }])).toBe(true);
  });

  it("rejects moving more than 1 card", () => {
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "c1", suit: "♠", rank: 8 }, { id: "c2", suit: "♥", rank: 7 }],
      faceUpCount: 2,
    };
    expect(bakersDozRuleset.canPickUp(pile, 2)).toBe(false);
    expect(bakersDozRuleset.canPickUp(pile, 1)).toBe(true);
  });

  it("allows any card on empty column", () => {
    const empty: Pile = { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(bakersDozRuleset.canStack(empty, [{ id: "c1", suit: "♦", rank: 5 }])).toBe(true);
  });

  it("rejects placing on same rank", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "c1", suit: "♠", rank: 8 }],
      faceUpCount: 1,
    };
    expect(bakersDozRuleset.canStack(target, [{ id: "c2", suit: "♥", rank: 8 }])).toBe(false);
  });
});

describe("BakersDozen reducer", () => {
  it("returns same state on illegal move", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1" });
    expect(next).toBe(s);
  });

  it("preserves card count after a move", () => {
    const s = initialState(42, settings);
    for (const fromId of ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13"]) {
        if (fromId === toId) continue;
        if (canMove(s.piles, { fromPile: fromId, toPile: toId, count: 1 }, bakersDozRuleset)) {
          const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId });
          const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
          expect(total).toBe(52);
          return;
        }
      }
    }
  });
});

describe("BakersDozen isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all foundations full", () => {
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
    for (let i = 1; i <= 13; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: BakersDozenState = {
      piles: wonPiles, score: 520, movesMade: 52, won: true, settings,
    };
    expect(isTerminal(wonState)!.score).toBe(520);
  });
});
