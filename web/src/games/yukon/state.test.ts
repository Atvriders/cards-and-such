import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, yukonRuleset } from "./state.js";
import type { YukonState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Yukon initialState", () => {
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

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    const j1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const j2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(j1).not.toEqual(j2);
  });

  it("no stock pile", () => {
    const s = initialState(5, settings);
    const stock = s.piles.find((p) => p.id === "stock");
    expect(stock).toBeUndefined();
  });

  it("4 empty foundations", () => {
    const s = initialState(5, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("Yukon ruleset", () => {
  it("canPickUp allows picking up any face-up sequence (even non-sequence)", () => {
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [
        { id: "c1", suit: "♠", rank: 8 },
        { id: "c2", suit: "♥", rank: 5 }, // not a valid sequence from c1
        { id: "c3", suit: "♣", rank: 9 },
      ],
      faceUpCount: 3,
    };
    // All 3 face-up so should be pickable in Yukon
    expect(yukonRuleset.canPickUp(pile, 3)).toBe(true);
  });

  it("cannot move to foundation with non-Ace to empty foundation", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "f1", count: 1 }, yukonRuleset)).toBe(false);
  });
});

describe("Yukon reducer", () => {
  it("legal tableau move updates state", () => {
    const s = initialState(42, settings);
    let moved = false;
    outer: for (const fromId of ["t1","t2","t3","t4","t5","t6","t7"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7"]) {
        if (fromId === toId) continue;
        for (let count = 1; count <= 4; count++) {
          if (canMove(s.piles, { fromPile: fromId, toPile: toId, count }, yukonRuleset)) {
            const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count });
            expect(next.movesMade).toBe(1);
            expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
            moved = true;
            break outer;
          }
        }
      }
    }
    expect(moved).toBe(true);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("Yukon isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all foundations hold 13 cards", () => {
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
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: YukonState = {
      piles: wonPiles, score: 520, movesMade: 80, won: true, settings,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
