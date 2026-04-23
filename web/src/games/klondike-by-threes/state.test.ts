import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeByThreesState, KlondikeByThreesSettings } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

const settings: KlondikeByThreesSettings = { redeals: "unlimited" };
const settingsLimited: KlondikeByThreesSettings = { redeals: "3" };

describe("Klondike by Threes initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42, settings);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(11, settings);
    const s2 = initialState(11, settings);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","));
  });

  it("stock has 24 cards", () => {
    expect(initialState(42, settings).piles.find((p) => p.id === "stock")!.cards.length).toBe(24);
  });
});

describe("Klondike by Threes draw", () => {
  it("draw adds up to 3 cards to waste", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(3);
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(21);
  });

  it("recycle puts waste back to stock (unlimited)", () => {
    const s = initialState(42, settings);
    let cur = s;
    // Drain stock
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const wasteLen = cur.piles.find((p) => p.id === "waste")!.cards.length;
    const recycled = reducer(cur, { type: "recycle" });
    expect(recycled.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(recycled.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
    expect(recycled.redealsUsed).toBe(1);
  });

  it("recycle is blocked after 3 redeals in limited mode", () => {
    const s = initialState(42, settingsLimited);
    let cur = s;
    // Do 3 redeals
    for (let pass = 0; pass < 3; pass++) {
      while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
        cur = reducer(cur, { type: "draw" });
      }
      cur = reducer(cur, { type: "recycle" });
    }
    expect(cur.redealsUsed).toBe(3);
    // Drain stock again
    while (cur.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      cur = reducer(cur, { type: "draw" });
    }
    const afterFourth = reducer(cur, { type: "recycle" });
    expect(afterFourth.redealsUsed).toBe(3); // blocked
  });

  it("total cards unchanged after draw", () => {
    const s = initialState(42, settings);
    const before = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "draw" });
    expect(next.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(before);
  });
});

describe("Klondike by Threes isTerminal", () => {
  it("returns null when not complete", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when 52 cards on foundations", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `k3${idx++}` })),
      });
    }
    for (let i = 1; i <= 7; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "stock", kind: "stock", cards: [] });
    piles.push({ id: "waste", kind: "waste", cards: [] });
    const wonState: KlondikeByThreesState = { piles, score: 300, movesMade: 60, redealsUsed: 1, won: true, settings };
    expect(isTerminal(wonState)!.score).toBe(300);
  });
});
