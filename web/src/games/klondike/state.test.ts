import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeState, KlondikeSettings } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const defaultSettings: KlondikeSettings = { drawMode: "1", scoringMode: "standard" };

describe("Klondike initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, defaultSettings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    const ids1 = s1.piles.map((p) => p.cards.map((c) => c.id)).flat();
    const ids2 = s2.piles.map((p) => p.cards.map((c) => c.id)).flat();
    expect(ids1).toEqual(ids2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    const ids1 = s1.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    const ids2 = s2.piles.map((p) => p.cards.map((c) => c.id)).flat().join(",");
    expect(ids1).not.toEqual(ids2);
  });

  it("tableau piles have correct sizes (1..7)", () => {
    const s = initialState(5, defaultSettings);
    for (let i = 1; i <= 7; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(i);
      expect(pile.faceUpCount).toBe(1);
    }
  });

  it("stock has 24 cards (52 - 28 dealt to tableau)", () => {
    const s = initialState(5, defaultSettings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(24);
  });
});

describe("Klondike reducer — draw action", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, defaultSettings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(wasteAfter).toBe(1);
  });

  it("draw-3 mode moves up to 3 cards", () => {
    const s = initialState(42, { drawMode: "3", scoringMode: "standard" });
    const next = reducer(s, { type: "draw" });
    const wasteAfter = next.piles.find((p) => p.id === "waste")!.cards.length;
    expect(wasteAfter).toBe(3);
  });

  it("draw on empty stock does nothing", () => {
    const s = initialState(42, defaultSettings);
    let cur = s;
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const after = reducer(cur, { type: "draw" });
    expect(after.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
  });
});

describe("Klondike reducer — recycle", () => {
  it("recycles waste back to stock when stock is empty", () => {
    const s = initialState(42, defaultSettings);
    let cur = s;
    const stockLen = cur.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) {
      cur = reducer(cur, { type: "draw" });
    }
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    expect(wasteLen).toBe(stockLen);
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });
});

describe("Klondike reducer — move", () => {
  it("legal move updates state", () => {
    const s = initialState(42, defaultSettings);
    let cur = s;
    let moved = false;

    for (let draws = 0; draws < 24 && !moved; draws++) {
      cur = reducer(cur, { type: "draw" });
      const waste = cur.piles.find((p) => p.id === "waste")!;
      if (waste.cards.length === 0) continue;
      const topWaste = waste.cards[waste.cards.length - 1]!;
      for (let ti = 1; ti <= 7 && !moved; ti++) {
        const tab = cur.piles.find((p) => p.id === `t${ti}`)!;
        if (tab.cards.length === 0) continue;
        const topTab = tab.cards[tab.cards.length - 1]!;
        const wasteIsRed = topWaste.suit === "♥" || topWaste.suit === "♦";
        const tabIsRed = topTab.suit === "♥" || topTab.suit === "♦";
        if (wasteIsRed !== tabIsRed && topWaste.rank === topTab.rank - 1) {
          const movesMadeBefore = cur.movesMade;
          const next = reducer(cur, { type: "move", fromPile: "waste", toPile: `t${ti}`, count: 1 });
          if (next.movesMade === movesMadeBefore + 1) {
            moved = true;
            expect(next.piles.find((p) => p.id === "waste")!.cards.length)
              .toBe(waste.cards.length - 1);
            expect(next.piles.find((p) => p.id === `t${ti}`)!.cards.length)
              .toBe(tab.cards.length + 1);
          }
        }
      }
    }
    expect(moved).toBe(true);
  });

  it("illegal move leaves state unchanged", () => {
    const s = initialState(42, defaultSettings);
    const before = s.piles.find((p) => p.id === "t1")!.cards.length;
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    const afterT1 = next.piles.find((p) => p.id === "t1")!.cards.length;
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(52);
    if (afterT1 < before) {
      expect(next.piles.find((p) => p.id === "t2")!.cards.length)
        .toBe(s.piles.find((p) => p.id === "t2")!.cards.length + 1);
    } else {
      expect(afterT1).toBe(before);
    }
  });

  it("moving 0 cards is rejected (same object)", () => {
    const s = initialState(42, defaultSettings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("Klondike isTerminal", () => {
  it("returns null when foundations are not full", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all foundations hold 13 cards", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

    const wonState: KlondikeState = {
      piles: wonPiles,
      score: 500,
      movesMade: 100,
      won: true,
      settings: defaultSettings,
      history: [],
    };

    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(500);
  });

  it("returns null when only 3 foundations are full", () => {
    const partialPiles: Pile[] = [];
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      partialPiles.push({
        id: `f${fi}`,
        kind: "foundation",
        cards: fi <= 3
          ? RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${suit}${rank}` }))
          : [],
      });
    }
    for (let i = 1; i <= 7; i++) {
      partialPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    partialPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    partialPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

    const partialState: KlondikeState = {
      piles: partialPiles,
      score: 300,
      movesMade: 50,
      won: false,
      settings: defaultSettings,
      history: [],
    };
    expect(isTerminal(partialState)).toBeNull();
  });
});

describe("Klondike scoring", () => {
  it("standard scoring starts at 0", () => {
    const s = initialState(1, { drawMode: "1", scoringMode: "standard" });
    expect(s.score).toBe(0);
  });

  it("vegas scoring starts at -52", () => {
    const s = initialState(1, { drawMode: "1", scoringMode: "vegas" });
    expect(s.score).toBe(-52);
  });

  it("terminal score is reflected in isTerminal result", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 7; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    wonPiles.push({ id: "stock", kind: "stock", cards: [], faceUpCount: 0 });
    wonPiles.push({ id: "waste", kind: "waste", cards: [], faceUpCount: 0 });

    const wonState: KlondikeState = {
      piles: wonPiles,
      score: 750,
      movesMade: 75,
      won: true,
      settings: defaultSettings,
      history: [],
    };
    expect(isTerminal(wonState)?.score).toBe(750);
  });
});
