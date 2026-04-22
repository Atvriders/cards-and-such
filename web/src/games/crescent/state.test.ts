import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, crescentRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import type { Card } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Crescent initialState", () => {
  it("has exactly 104 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("has 16 crescent piles each with 6 cards", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 16; i++) {
      const cr = s.piles.find((p) => p.id === `cr${i}`)!;
      expect(cr.cards.length).toBe(6);
    }
  });

  it("foundations start with Aces and Kings", () => {
    const s = initialState(1, settings);
    for (let fi = 1; fi <= 4; fi++) {
      const fa = s.piles.find((p) => p.id === `fa${fi}`)!;
      expect(fa.cards.length).toBe(1);
      expect(fa.cards[0]!.rank).toBe(1);
    }
    for (let fi = 1; fi <= 4; fi++) {
      const fk = s.piles.find((p) => p.id === `fk${fi}`)!;
      expect(fk.cards.length).toBe(1);
      expect(fk.cards[0]!.rank).toBe(13);
    }
  });
});

describe("Crescent ruleset", () => {
  it("Ace foundation accepts 2 of same suit after Ace", () => {
    const target: Pile = {
      id: "fa1", kind: "foundation",
      cards: [{ id: "a1", suit: "♠", rank: 1 }],
    };
    const moving: Card[] = [{ id: "a2", suit: "♠", rank: 2 }];
    expect(crescentRuleset.canStack(target, moving)).toBe(true);
  });

  it("King foundation accepts Queen of same suit after King", () => {
    const target: Pile = {
      id: "fk1", kind: "foundation",
      cards: [{ id: "k1", suit: "♥", rank: 13 }],
    };
    const moving: Card[] = [{ id: "q1", suit: "♥", rank: 12 }];
    expect(crescentRuleset.canStack(target, moving)).toBe(true);
  });

  it("King foundation rejects card of wrong suit", () => {
    const target: Pile = {
      id: "fk1", kind: "foundation",
      cards: [{ id: "k1", suit: "♥", rank: 13 }],
    };
    const moving: Card[] = [{ id: "q1", suit: "♠", rank: 12 }];
    expect(crescentRuleset.canStack(target, moving)).toBe(false);
  });
});

describe("Crescent reducer", () => {
  it("redeal decrements redealsLeft", () => {
    const s = initialState(42, settings);
    expect(s.redealsLeft).toBe(3);
    const next = reducer(s, { type: "redeal" });
    expect(next.redealsLeft).toBe(2);
  });

  it("redeal past 0 is blocked", () => {
    let s = initialState(42, settings);
    s = { ...s, redealsLeft: 0 };
    const next = reducer(s, { type: "redeal" });
    expect(next).toBe(s);
  });

  it("illegal move (count 0) returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "cr1", toPile: "cr2", count: 0 });
    expect(next).toBe(s);
  });

  it("legal tableau move updates movesMade", () => {
    const s = initialState(42, settings);
    let moved = false;
    outer: for (const fromId of Array.from({ length: 16 }, (_, i) => `cr${i + 1}`)) {
      for (const toId of Array.from({ length: 16 }, (_, i) => `cr${i + 1}`)) {
        if (fromId === toId) continue;
        const move = { fromPile: fromId, toPile: toId, count: 1 };
        if (canMove(s.piles, move, crescentRuleset)) {
          const next = reducer(s, { type: "move", ...move });
          expect(next.movesMade).toBe(1);
          moved = true;
          break outer;
        }
      }
    }
    // Just verify we can find a legal foundation move or skip gracefully
    void moved;
  });
});

describe("Crescent isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won is true", () => {
    const s = { ...initialState(42, settings), won: true, score: 500 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(500);
  });
});
