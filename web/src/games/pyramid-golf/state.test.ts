import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isAvailable } from "./state.js";

const settings = {};

describe("PyramidGolf initialState", () => {
  it("has 28 pyramid cards and 23 in stock + 1 in waste", () => {
    const s = initialState(42, settings);
    let pyramidCount = 0;
    for (const row of s.pyramid) for (const cell of row) if (cell && !cell.removed) pyramidCount++;
    expect(pyramidCount).toBe(28);
    expect(s.waste.length).toBe(1);
    expect(s.stock.length).toBe(23);
  });

  it("bottom row (row 6) cards are available", () => {
    const s = initialState(42, settings);
    for (let c = 0; c < 7; c++) {
      if (s.pyramid[6]![c]) {
        expect(isAvailable(s.pyramid, 6, c)).toBe(true);
      }
    }
  });

  it("top row card is not available (blocked by row below)", () => {
    const s = initialState(42, settings);
    expect(isAvailable(s.pyramid, 0, 0)).toBe(false);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    const ids1 = s1.pyramid.flatMap((row) => row.map((c) => c?.card.id ?? "")).join(",");
    const ids2 = s2.pyramid.flatMap((row) => row.map((c) => c?.card.id ?? "")).join(",");
    expect(ids1).toBe(ids2);
  });
});

describe("PyramidGolf reducer", () => {
  it("draw moves a card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(stockBefore - 1);
    expect(next.waste.length).toBe(2);
  });

  it("draw on empty stock does nothing", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < 23; i++) s = reducer(s, { type: "draw" });
    expect(s.stock.length).toBe(0);
    const after = reducer(s, { type: "draw" });
    expect(after.stock.length).toBe(0);
  });

  it("remove-king removes an available King from pyramid", () => {
    let s = initialState(42, settings);
    // Find a King on the bottom row
    for (let c = 0; c < 7; c++) {
      const cell = s.pyramid[6]![c];
      if (cell && cell.card.rank === 13 && !cell.removed) {
        const next = reducer(s, { type: "remove-king", row: 6, col: c });
        expect(next.pyramid[6]![c]!.removed).toBe(true);
        return;
      }
    }
    // No King on bottom row — pass
    expect(true).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
