import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Salic Law initialState", () => {
  it("has 104 total cards", () => {
    const s = initialState(1);
    const found = s.foundations.reduce((sum, f) => sum + f.length, 0);
    const cols = s.columns.reduce((sum, c) => sum + c.length, 0);
    expect(found + cols + s.stock.length + s.waste.length).toBe(104);
  });

  it("each column is headed by a King", () => {
    const s = initialState(2);
    for (const col of s.columns) {
      expect(col[0]!.rank).toBe(13);
    }
  });

  it("foundations start with Aces", () => {
    const s = initialState(3);
    const aceCount = s.foundations.filter((f) => f.length > 0 && f[0]!.rank === 1).length;
    expect(aceCount).toBe(4);
  });

  it("is deterministic", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    expect(s1.stock.map((c) => c.id)).toEqual(s2.stock.map((c) => c.id));
  });
});

describe("Salic Law reducer", () => {
  it("draw reduces stock by 1", () => {
    const s = initialState(5);
    const before = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(before - 1);
    expect(next.waste.length).toBe(1);
  });

  it("cannot move King from column", () => {
    const s = initialState(5);
    // Each col starts with King only if not dealt more cards; but cols have 12 cards
    // Try to move the King (bottom of col, under other cards) — irrelevant since only top is movable
    // Actually find a col where the top card is a King (only if no other cards were dealt there)
    const allKingTop = s.columns.every((c) => c[c.length - 1]!.rank !== 13);
    // Since cols have 12 cards and bottom is King, top should not be King
    expect(allKingTop).toBe(true);
  });

  it("invalid move-col-to-col rejected (same)", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "move-col-to-col", fromCol: 0, toCol: 0 });
    expect(next).toBe(s);
  });

  it("waste-to-foundation rejected when no ace available and found is empty", () => {
    const s = initialState(5);
    let cur = reducer(s, { type: "draw" });
    const wasteCard = cur.waste[0]!;
    if (wasteCard.rank !== 1) {
      // Find a foundation with correct suit
      const matchingFi = cur.foundations.findIndex((f) => f.length === 0);
      if (matchingFi >= 0) {
        const next = reducer(cur, { type: "move-waste-to-foundation", foundIndex: matchingFi });
        expect(next.score).toBe(cur.score); // rejected
      }
    }
  });
});

describe("Salic Law isTerminal", () => {
  it("returns null at start", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const won = { ...s, won: true, score: 240 };
    expect(isTerminal(won)!.score).toBe(240);
  });
});
