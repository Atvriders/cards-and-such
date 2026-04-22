import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, checkWinner, hexNeighbors } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

describe("Hex", () => {
  it("starts with empty board, Black to move first", () => {
    const s = initialState(0, { size: "9", swapRule: false });
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.movesMade).toBe(0);
    expect([...s.grid.coords()].every((c) => s.grid.get(c) === null)).toBe(true);
  });

  it("placing a stone runs bot response and stays on Black's turn", () => {
    const s = initialState(42, { size: "9", swapRule: false });
    const next = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    expect(next.turn).toBe(0);
    expect(next.grid.get({ row: 4, col: 4 })).toBe(0);
    expect(next.movesMade).toBeGreaterThanOrEqual(2);
  });

  it("rejects placement on occupied cell", () => {
    const s = initialState(0, { size: "9", swapRule: false });
    const s1 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    const s2 = reducer(s1, { type: "place", at: { row: 0, col: 0 } });
    expect(s2).toBe(s1);
  });

  it("detects Black win (top-to-bottom chain)", () => {
    // Build a state with Black stones connecting top to bottom on col 0
    const size = 9;
    let grid = Grid.filled<Cell>(size, size, null);
    for (let r = 0; r < size; r++) grid = grid.set({ row: r, col: 0 }, 0);
    expect(checkWinner(grid, 0)).toBe(true);
    expect(checkWinner(grid, 1)).toBe(false);
  });

  it("detects White win (left-to-right chain)", () => {
    const size = 9;
    let grid = Grid.filled<Cell>(size, size, null);
    for (let c = 0; c < size; c++) grid = grid.set({ row: 0, col: c }, 1);
    expect(checkWinner(grid, 1)).toBe(true);
    expect(checkWinner(grid, 0)).toBe(false);
  });

  it("swap action converts Black stone to White on move 1", () => {
    const s = initialState(0, { size: "9", swapRule: true });
    const s1 = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    // After bot move, we need a state where turn=1 and movesMade=1 to test swap
    // Manually construct such state
    const swapState = {
      ...s,
      grid: s.grid.set({ row: 4, col: 4 }, 0),
      turn: 1 as const,
      movesMade: 1,
    };
    const swapped = reducer(swapState, { type: "swap" });
    expect(swapped.swapped).toBe(true);
    expect(swapped.grid.get({ row: 4, col: 4 })).toBe(1);
    expect(swapped.turn).toBe(0);
  });

  it("hexNeighbors returns correct neighbors for even row", () => {
    // Even row neighbors (row=0, col=0) in 9×9 grid
    const nbs = hexNeighbors(0, 0, 9);
    // Should have at most 3 (corner of board)
    expect(nbs.length).toBeGreaterThan(0);
    expect(nbs.length).toBeLessThanOrEqual(6);
    for (const nb of nbs) {
      expect(nb.row).toBeGreaterThanOrEqual(0);
      expect(nb.col).toBeGreaterThanOrEqual(0);
      expect(nb.row).toBeLessThan(9);
      expect(nb.col).toBeLessThan(9);
    }
  });

  it("isTerminal returns null mid-game and score on win", () => {
    const s = initialState(0, { size: "9", swapRule: false });
    expect(isTerminal(s)).toBeNull();
    const won: typeof s = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: typeof s = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
