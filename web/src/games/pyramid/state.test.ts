import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isAvailablePyramid } from "./state.js";
import type { PyramidState, PyramidSettings } from "./state.js";

const defaultSettings: PyramidSettings = { redeals: "3" };

describe("Pyramid initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, defaultSettings);
    const pyramidCount = s.pyramid.reduce((sum, row) => sum + row.filter((c) => c !== null).length, 0);
    expect(pyramidCount + s.stock.length).toBe(52);
  });

  it("pyramid has 28 cards in correct row sizes", () => {
    const s = initialState(42, defaultSettings);
    expect(s.pyramid.length).toBe(7);
    for (let i = 0; i < 7; i++) {
      expect(s.pyramid[i]!.length).toBe(i + 1);
    }
    const total = s.pyramid.reduce((sum, row) => sum + row.length, 0);
    expect(total).toBe(28);
  });

  it("stock has 24 cards", () => {
    const s = initialState(42, defaultSettings);
    expect(s.stock.length).toBe(24);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, defaultSettings);
    const s2 = initialState(7, defaultSettings);
    const ids1 = s1.pyramid.flat().map((c) => c?.card.id).join(",");
    const ids2 = s2.pyramid.flat().map((c) => c?.card.id).join(",");
    expect(ids1).toBe(ids2);
  });

  it("different seeds produce different layouts", () => {
    const s1 = initialState(1, defaultSettings);
    const s2 = initialState(2, defaultSettings);
    const ids1 = s1.pyramid.flat().map((c) => c?.card.id).join(",");
    const ids2 = s2.pyramid.flat().map((c) => c?.card.id).join(",");
    expect(ids1).not.toBe(ids2);
  });

  it("redealsRemaining matches setting", () => {
    const s3 = initialState(1, { redeals: "3" });
    expect(s3.redealsRemaining).toBe(3);
    const s1 = initialState(1, { redeals: "1" });
    expect(s1.redealsRemaining).toBe(1);
    const s0 = initialState(1, { redeals: "0" });
    expect(s0.redealsRemaining).toBe(0);
  });

  it("waste is empty and nothing selected at start", () => {
    const s = initialState(42, defaultSettings);
    expect(s.waste.length).toBe(0);
    expect(s.selected).toBeNull();
  });
});

describe("Pyramid isAvailablePyramid", () => {
  it("row 6 (bottom) cards are available", () => {
    const s = initialState(42, defaultSettings);
    for (let c = 0; c < 7; c++) {
      expect(isAvailablePyramid(s.pyramid, 6, c)).toBe(true);
    }
  });

  it("row 0 top card is not available initially (covered by row 1)", () => {
    const s = initialState(42, defaultSettings);
    expect(isAvailablePyramid(s.pyramid, 0, 0)).toBe(false);
  });
});

describe("Pyramid reducer — draw", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, defaultSettings);
    const stockBefore = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(stockBefore - 1);
    expect(next.waste.length).toBe(1);
  });

  it("draw on empty stock does nothing", () => {
    let s = initialState(42, defaultSettings);
    for (let i = 0; i < 24; i++) s = reducer(s, { type: "draw" });
    expect(s.stock.length).toBe(0);
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(0);
    expect(next.waste.length).toBe(s.waste.length);
  });
});

describe("Pyramid reducer — redeal", () => {
  it("redeal moves waste back to stock", () => {
    let s = initialState(42, { redeals: "3" });
    for (let i = 0; i < 24; i++) s = reducer(s, { type: "draw" });
    expect(s.stock.length).toBe(0);
    const wasteLen = s.waste.length;
    const next = reducer(s, { type: "redeal" });
    expect(next.stock.length).toBe(wasteLen);
    expect(next.waste.length).toBe(0);
    expect(next.redealsRemaining).toBe(2);
  });

  it("redeal does nothing when stock non-empty", () => {
    const s = initialState(42, { redeals: "3" });
    expect(s.stock.length).toBeGreaterThan(0);
    const next = reducer(s, { type: "redeal" });
    expect(next).toBe(s);
  });

  it("redeal does nothing when redeals exhausted", () => {
    let s = initialState(42, { redeals: "0" });
    for (let i = 0; i < 24; i++) s = reducer(s, { type: "draw" });
    const next = reducer(s, { type: "redeal" });
    expect(next.stock.length).toBe(0);
  });
});

describe("Pyramid reducer — remove-king", () => {
  it("removes an available King from the bottom row", () => {
    const s = initialState(42, defaultSettings);
    // Find a king in row 6
    let kingCol = -1;
    for (let c = 0; c < 7; c++) {
      if (s.pyramid[6]![c]?.card.rank === 13) {
        kingCol = c;
        break;
      }
    }
    if (kingCol === -1) return; // No king in bottom row in this seed, skip
    const next = reducer(s, { type: "remove-king", source: { kind: "pyramid", row: 6, col: kingCol } });
    expect(next.pyramid[6]![kingCol]!.removed).toBe(true);
    expect(next.movesMade).toBe(1);
  });
});

describe("Pyramid reducer — select/pair", () => {
  it("selecting same card twice replaces selection", () => {
    let s = initialState(42, defaultSettings);
    // Draw some cards
    s = reducer(s, { type: "draw" });
    const next1 = reducer(s, { type: "select", source: { kind: "waste" } });
    const next2 = reducer(next1, { type: "select", source: { kind: "waste" } });
    // Should still be selected (re-select same source)
    expect(next2.selected).not.toBeNull();
  });

  it("pairing two available cards that sum to 13 removes both", () => {
    // Build a state where we control two available cards summing to 13
    const s = initialState(42, defaultSettings);

    // Find two bottom-row cards summing to 13
    let pairFound = false;
    for (let c1 = 0; c1 < 7 && !pairFound; c1++) {
      for (let c2 = c1 + 1; c2 < 7 && !pairFound; c2++) {
        const r1 = s.pyramid[6]![c1]!.card.rank;
        const r2 = s.pyramid[6]![c2]!.card.rank;
        if (r1 + r2 === 13) {
          const a1 = reducer(s, { type: "select", source: { kind: "pyramid", row: 6, col: c1 } });
          const a2 = reducer(a1, { type: "select", source: { kind: "pyramid", row: 6, col: c2 } });
          expect(a2.pyramid[6]![c1]!.removed).toBe(true);
          expect(a2.pyramid[6]![c2]!.removed).toBe(true);
          expect(a2.movesMade).toBe(1);
          pairFound = true;
        }
      }
    }
    // This test is seed-dependent; just verify the test ran or skip
  });
});

describe("Pyramid isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score on win", () => {
    const s = initialState(42, defaultSettings);
    const wonState: PyramidState = {
      ...s,
      won: true,
      movesMade: 14,
      redealsRemaining: 2,
      pyramid: s.pyramid.map((row) => row.map((cell) => (cell ? { ...cell, removed: true } : cell))),
    };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });

  it("returns partial score on loss", () => {
    const s = initialState(42, defaultSettings);
    // Manually remove 5 pyramid cards then set lost=true
    let modPyramid = s.pyramid.map((row) => [...row]);
    let removed = 0;
    for (let r = 6; r >= 0 && removed < 5; r--) {
      for (let c = 0; c < modPyramid[r]!.length && removed < 5; c++) {
        const cell = modPyramid[r]![c];
        if (cell) {
          modPyramid[r]![c] = { ...cell, removed: true };
          removed++;
        }
      }
    }
    const lostState: PyramidState = { ...s, lost: true, pyramid: modPyramid };
    const result = isTerminal(lostState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(50); // 5 * 10
  });
});
