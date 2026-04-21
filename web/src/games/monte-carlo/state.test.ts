import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MonteCarloState } from "./state.js";

const settings = {};

describe("MonteCarlo initialState", () => {
  it("grid has 25 cards, stock has 27 (total 52)", () => {
    const s = initialState(42, settings);
    const gridCards = s.grid.filter((c) => c !== null).length;
    expect(gridCards).toBe(25);
    expect(s.stock.length).toBe(27);
    expect(gridCards + s.stock.length).toBe(52);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.grid.map((c) => c?.id ?? "null");
    const ids2 = s2.grid.map((c) => c?.id ?? "null");
    expect(ids1).toEqual(ids2);
    const stockIds1 = s1.stock.map((c) => c.id);
    const stockIds2 = s2.stock.map((c) => c.id);
    expect(stockIds1).toEqual(stockIds2);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    const j1 = s1.grid.map((c) => c?.id ?? "null").join(",");
    const j2 = s2.grid.map((c) => c?.id ?? "null").join(",");
    expect(j1).not.toEqual(j2);
  });
});

describe("MonteCarlo reducer", () => {
  it("valid adjacent same-rank pair is removed", () => {
    // Build a state with known pair at positions 0 and 1
    const s = initialState(42, settings);
    const patched: MonteCarloState = {
      ...s,
      grid: s.grid.map((c, i) => {
        if (i === 0) return { id: "test-A1", suit: "♠" as const, rank: 5 as const };
        if (i === 1) return { id: "test-A2", suit: "♥" as const, rank: 5 as const };
        return c;
      }),
    };
    const next = reducer(patched, { type: "select-pair", pos1: 0, pos2: 1 });
    expect(next.movesMade).toBe(1);
    expect(next.score).toBe(2);
  });

  it("non-adjacent pair is rejected", () => {
    const s = initialState(42, settings);
    const patched: MonteCarloState = {
      ...s,
      grid: s.grid.map((c, i) => {
        if (i === 0) return { id: "test-A1", suit: "♠" as const, rank: 7 as const };
        if (i === 6) return { id: "test-A2", suit: "♥" as const, rank: 7 as const };
        return c;
      }),
    };
    // positions 0 (row0,col0) and 6 (row1,col1) ARE adjacent diagonally, so use 0 and 7
    // pos 0 (r0,c0), pos 7 (r1,c2): row diff 1, col diff 2 — not adjacent
    const patched2: MonteCarloState = {
      ...s,
      grid: s.grid.map((c, i) => {
        if (i === 0) return { id: "test-B1", suit: "♠" as const, rank: 9 as const };
        if (i === 7) return { id: "test-B2", suit: "♥" as const, rank: 9 as const };
        return c;
      }),
    };
    const next = reducer(patched2, { type: "select-pair", pos1: 0, pos2: 7 });
    expect(next).toBe(patched2);
  });

  it("different rank pair is rejected", () => {
    const s = initialState(42, settings);
    const patched: MonteCarloState = {
      ...s,
      grid: s.grid.map((c, i) => {
        if (i === 0) return { id: "test-C1", suit: "♠" as const, rank: 3 as const };
        if (i === 1) return { id: "test-C2", suit: "♥" as const, rank: 4 as const };
        return c;
      }),
    };
    const next = reducer(patched, { type: "select-pair", pos1: 0, pos2: 1 });
    expect(next).toBe(patched);
  });

  it("compacts and fills after removal", () => {
    const s = initialState(42, settings);
    const stockBefore = s.stock.length;
    // Patch a valid pair at 0 and 1
    const patched: MonteCarloState = {
      ...s,
      grid: s.grid.map((c, i) => {
        if (i === 0) return { id: "test-D1", suit: "♠" as const, rank: 6 as const };
        if (i === 1) return { id: "test-D2", suit: "♥" as const, rank: 6 as const };
        return c;
      }),
    };
    const next = reducer(patched, { type: "select-pair", pos1: 0, pos2: 1 });
    // 2 cards removed, grid should still have 25 positions (2 filled from stock or null)
    expect(next.grid.length).toBe(25);
    expect(next.stock.length).toBe(Math.max(0, stockBefore - 2));
  });
});

describe("MonteCarlo isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(42, settings);
    const won: MonteCarloState = {
      ...s,
      grid: Array(25).fill(null) as null[],
      stock: [],
      won: true,
      score: 52,
    };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(52);
  });
});
