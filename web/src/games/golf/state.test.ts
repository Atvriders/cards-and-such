import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GolfSettings } from "./state.js";

const noWrap: GolfSettings = { wrapAces: false };
const withWrap: GolfSettings = { wrapAces: true };

describe("Golf initialState", () => {
  it("has 35 tableau cards, 1 waste card, and 16 stock cards (total 52)", () => {
    const s = initialState(42, noWrap);
    const tableauTotal = s.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(tableauTotal).toBe(35);
    expect(s.waste.length).toBe(1);
    expect(s.stock.length).toBe(16);
    expect(tableauTotal + s.waste.length + s.stock.length).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, noWrap);
    const s2 = initialState(99, noWrap);
    const ids1 = [...s1.tableau.flat(), ...s1.waste, ...s1.stock].map((c) => c.id);
    const ids2 = [...s2.tableau.flat(), ...s2.waste, ...s2.stock].map((c) => c.id);
    expect(ids1).toEqual(ids2);
  });

  it("7 columns of 5 cards each", () => {
    const s = initialState(1, noWrap);
    expect(s.tableau.length).toBe(7);
    for (const col of s.tableau) {
      expect(col.length).toBe(5);
    }
  });
});

describe("Golf reducer — draw", () => {
  it("draw moves top stock card to waste", () => {
    const s = initialState(42, noWrap);
    const stockTop = s.stock[s.stock.length - 1]!;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(s.stock.length - 1);
    expect(next.waste[next.waste.length - 1]!.id).toBe(stockTop.id);
  });

  it("draw on empty stock does nothing", () => {
    const s = initialState(42, noWrap);
    let cur = s;
    for (let i = 0; i < s.stock.length; i++) {
      cur = reducer(cur, { type: "draw" });
    }
    expect(cur.stock.length).toBe(0);
    const after = reducer(cur, { type: "draw" });
    expect(after).toBe(cur);
  });
});

describe("Golf reducer — move-to-waste", () => {
  it("plays a card that differs by 1 rank from waste top", () => {
    const s = initialState(42, noWrap);
    // Force a known scenario: find a column where top card is ±1 from waste top
    const wasteTop = s.waste[s.waste.length - 1]!;
    const wasteRank = wasteTop.rank as number;
    let played = false;
    for (let col = 0; col < 7 && !played; col++) {
      const colCards = s.tableau[col]!;
      const topCard = colCards[colCards.length - 1];
      if (!topCard) continue;
      const diff = Math.abs((topCard.rank as number) - wasteRank);
      if (diff === 1) {
        const next = reducer(s, { type: "move-to-waste", colIndex: col });
        expect(next.tableau[col]!.length).toBe(colCards.length - 1);
        expect(next.waste[next.waste.length - 1]!.id).toBe(topCard.id);
        played = true;
      }
    }
    // It's possible no card ±1 exists — that's ok, just verify state didn't change
    if (!played) {
      const next = reducer(s, { type: "move-to-waste", colIndex: 0 });
      // Should be unchanged since no legal move
      const colLen = s.tableau[0]!.length;
      expect(next.tableau[0]!.length).toBe(colLen);
    }
  });

  it("illegal play (rank differs by more than 1) is rejected", () => {
    // Build a state where waste top is Ace (1) and col top is 3
    const s = initialState(42, noWrap);
    // We patch the state
    const patched = {
      ...s,
      waste: [{ id: "patch-A", suit: "♠" as const, rank: 1 as const }],
      tableau: s.tableau.map((col, i) =>
        i === 0
          ? [{ id: "patch-3", suit: "♥" as const, rank: 3 as const }]
          : [...col],
      ),
    };
    const next = reducer(patched, { type: "move-to-waste", colIndex: 0 });
    expect(next).toBe(patched);
  });

  it("wrap aces: King (13) can play on Ace (1) when wrapAces=true", () => {
    const s = initialState(42, withWrap);
    const patched = {
      ...s,
      waste: [{ id: "patch-A", suit: "♠" as const, rank: 1 as const }],
      tableau: s.tableau.map((col, i) =>
        i === 0
          ? [{ id: "patch-K", suit: "♥" as const, rank: 13 as const }]
          : [...col],
      ),
    };
    const next = reducer(patched, { type: "move-to-waste", colIndex: 0 });
    expect(next.waste[next.waste.length - 1]!.id).toBe("patch-K");
  });
});

describe("Golf isTerminal", () => {
  it("returns null when tableau still has cards", () => {
    const s = initialState(42, noWrap);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all tableau and stock are empty", () => {
    const s = initialState(42, noWrap);
    const won = {
      ...s,
      tableau: Array(7).fill([]) as [],
      stock: [],
      waste: s.waste,
      won: true,
      score: 35,
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(35);
  });
});
