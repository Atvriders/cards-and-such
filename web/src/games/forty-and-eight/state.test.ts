import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, fortyAndEightRuleset } from "./state.js";
import type { FortyAndEightState } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("FortyAndEight initialState", () => {
  it("has exactly 104 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("8 tableau columns of 5 cards each", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(5);
      expect(t.faceUpCount).toBe(5);
    }
  });

  it("stock has 64 cards and 1 redeal", () => {
    const s = initialState(42, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(64);
    expect(s.redealsLeft).toBe(1);
  });

  it("8 empty foundations", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 8; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("FortyAndEight ruleset", () => {
  it("rejects cross-suit tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♥", rank: 7 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 6 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, fortyAndEightRuleset)).toBe(false);
  });

  it("allows same-suit descending tableau move", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 8 }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ id: "c2", suit: "♠", rank: 7 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, fortyAndEightRuleset)).toBe(true);
  });

  it("allows move to empty column", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 9 }], faceUpCount: 1 },
    ];
    expect(canMove(piles, { fromPile: "t2", toPile: "t1", count: 1 }, fortyAndEightRuleset)).toBe(true);
  });
});

describe("FortyAndEight reducer", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("redeal on empty stock moves waste back to stock", () => {
    const s = initialState(1, settings);
    // Drain stock by setting it empty and waste full
    const modified: FortyAndEightState = {
      ...s,
      piles: s.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: [] };
        if (p.id === "waste") return { ...p, cards: [{ id: "w1", suit: "♠" as Suit, rank: 5 as Rank }] };
        return p;
      }),
    };
    const next = reducer(modified, { type: "redeal" });
    expect(next.redealsLeft).toBe(0);
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("second redeal is rejected", () => {
    const s = initialState(1, settings);
    const zeroRedeals: FortyAndEightState = { ...s, redealsLeft: 0 };
    const modified: FortyAndEightState = {
      ...zeroRedeals,
      piles: zeroRedeals.piles.map((p) => {
        if (p.id === "stock") return { ...p, cards: [] };
        if (p.id === "waste") return { ...p, cards: [{ id: "w1", suit: "♠" as Suit, rank: 5 as Rank }] };
        return p;
      }),
    };
    const next = reducer(modified, { type: "redeal" });
    expect(next).toBe(modified);
  });

  it("illegal move is rejected", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });
});

describe("FortyAndEight isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all 104 cards on foundations", () => {
    const wonPiles: Pile[] = [
      { id: "stock", kind: "stock", cards: [], faceUpCount: 0 },
      { id: "waste", kind: "waste", cards: [] },
    ];
    let idx = 0;
    for (let fi = 1; fi <= 8; fi++) {
      const suit = SUITS[(fi - 1) % 4]!;
      wonPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `w${idx++}` })),
      });
    }
    for (let i = 1; i <= 8; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState: FortyAndEightState = {
      piles: wonPiles, score: 1040, movesMade: 300, won: true, redealsLeft: 0, settings,
    };
    expect(isTerminal(wonState)).toEqual({ score: 1040 });
  });
});
