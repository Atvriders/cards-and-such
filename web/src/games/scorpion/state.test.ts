import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scorpionRuleset } from "./state.js";
import type { ScorpionState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("Scorpion initialState", () => {
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

  it("7 tableau columns of 7 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 7; i++) {
      const tab = s.piles.find((p) => p.id === `t${i}`)!;
      expect(tab.cards.length).toBe(7);
    }
  });

  it("first 4 columns have 4 face-up cards, last 3 have 7", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `t${i}`)!.faceUpCount).toBe(4);
    }
    for (let i = 5; i <= 7; i++) {
      expect(s.piles.find((p) => p.id === `t${i}`)!.faceUpCount).toBe(7);
    }
  });

  it("reserve has 3 cards", () => {
    const s = initialState(42, settings);
    const reserve = s.piles.find((p) => p.id === "reserve")!;
    expect(reserve.cards.length).toBe(3);
  });
});

describe("Scorpion ruleset", () => {
  it("rejects cross-suit tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 8 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "t2", count: 1 }, scorpionRuleset)).toBe(false);
  });

  it("allows same-suit descending move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 8 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t1", toPile: "t2", count: 1 }, scorpionRuleset)).toBe(true);
  });
});

describe("Scorpion reducer", () => {
  it("deal-reserve adds 3 cards to first 3 columns", () => {
    const s = initialState(42, settings);
    const beforeLens = [1, 2, 3].map((i) => s.piles.find((p) => p.id === `t${i}`)!.cards.length);
    const next = reducer(s, { type: "deal-reserve" });
    for (let i = 0; i < 3; i++) {
      const tab = next.piles.find((p) => p.id === `t${i + 1}`)!;
      expect(tab.cards.length).toBe(beforeLens[i]! + 1);
    }
    expect(next.reserveDealt).toBe(true);
  });

  it("deal-reserve can only happen once", () => {
    const s = initialState(42, settings);
    const s2 = reducer(s, { type: "deal-reserve" });
    const s3 = reducer(s2, { type: "deal-reserve" });
    expect(s3).toBe(s2);
  });

  it("illegal move (0 count) is rejected", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("Scorpion isTerminal", () => {
  it("returns null when completedSuits < 4", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when 4 suits completed", () => {
    const wonState: ScorpionState = {
      piles: [
        { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t2", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "t7", kind: "tableau", cards: [], faceUpCount: 0 },
        { id: "reserve", kind: "stock", cards: [], faceUpCount: 0 },
      ],
      score: 400,
      movesMade: 100,
      completedSuits: 4,
      won: true,
      reserveDealt: true,
      settings,
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(400);
  });
});
