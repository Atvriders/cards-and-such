import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, russianRuleset } from "./state.js";
import type { RussianSolitaireState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("RussianSolitaire initialState", () => {
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

  it("has 4 empty foundations at start", () => {
    const s = initialState(5, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });

  it("has 7 tableau columns", () => {
    const s = initialState(10, settings);
    const tabs = s.piles.filter((p) => p.kind === "tableau");
    expect(tabs.length).toBe(7);
  });
});

describe("RussianSolitaire ruleset", () => {
  it("same-suit descending is allowed on tableau", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "c1", suit: "♠" as const, rank: 8 as const }],
      faceUpCount: 1,
    };
    const moving = [{ id: "c2", suit: "♠" as const, rank: 7 as const }];
    expect(russianRuleset.canStack(target, moving)).toBe(true);
  });

  it("different suit is rejected on tableau", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "c1", suit: "♠" as const, rank: 8 as const }],
      faceUpCount: 1,
    };
    const moving = [{ id: "c2", suit: "♥" as const, rank: 7 as const }];
    expect(russianRuleset.canStack(target, moving)).toBe(false);
  });

  it("only Kings may go on empty tableau", () => {
    const empty: Pile = { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(russianRuleset.canStack(empty, [{ id: "c1", suit: "♠" as const, rank: 13 as const }])).toBe(true);
    expect(russianRuleset.canStack(empty, [{ id: "c1", suit: "♠" as const, rank: 12 as const }])).toBe(false);
  });

  it("cannot move to foundation with non-Ace to empty foundation", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 },
      { id: "f1", kind: "foundation", cards: [] },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "f1", count: 1 }, russianRuleset)).toBe(false);
  });
});

describe("RussianSolitaire reducer", () => {
  it("illegal move returns same state reference", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("increments movesMade on legal move", () => {
    const s = initialState(42, settings);
    // Find a legal move
    for (const fromId of ["t1","t2","t3","t4","t5","t6","t7"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7"]) {
        if (fromId === toId) continue;
        for (let count = 1; count <= 3; count++) {
          if (canMove(s.piles, { fromPile: fromId, toPile: toId, count }, russianRuleset)) {
            const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count });
            expect(next.movesMade).toBe(1);
            return;
          }
        }
      }
    }
  });

  it("total cards preserved after any move", () => {
    const s = initialState(99, settings);
    for (const fromId of ["t1","t2","t3","t4","t5","t6","t7"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7"]) {
        if (fromId === toId) continue;
        if (canMove(s.piles, { fromPile: fromId, toPile: toId, count: 1 }, russianRuleset)) {
          const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count: 1 });
          const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
          expect(total).toBe(52);
          return;
        }
      }
    }
  });
});

describe("RussianSolitaire isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score object when all foundations full", () => {
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
    const wonState: RussianSolitaireState = {
      piles: wonPiles, score: 520, movesMade: 80, won: true, settings,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(520);
  });
});
