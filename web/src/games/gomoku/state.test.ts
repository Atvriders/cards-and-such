import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, type GomokuState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

describe("Gomoku", () => {
  it("starts with empty board, Black to move first", () => {
    const s = initialState(0, { boardSize: "9" });
    expect(s.turn).toBe("B");
    expect(s.winner).toBeNull();
    expect([...s.grid.coords()].every((c) => s.grid.get(c) === null)).toBe(true);
  });

  it("player placing a stone switches turn to White (then bot responds)", () => {
    const s = initialState(0, { boardSize: "9" });
    const next = reducer(s, { type: "place", at: { row: 4, col: 4 } });
    // After player move, bot responds, so it's Black's turn again (if no winner)
    expect(next.turn).toBe("B");
    expect(next.grid.get({ row: 4, col: 4 })).toBe("B");
  });

  it("rejects placement on occupied cell", () => {
    const s = initialState(0, { boardSize: "9" });
    const s1 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    // Try to place on same cell
    const s2 = reducer(s1, { type: "place", at: { row: 0, col: 0 } });
    expect(s2).toBe(s1);
  });

  it("detects five in a row winner", () => {
    // Build a state with four Black stones in a row, then place fifth
    const size = 9;
    let grid = Grid.filled<Cell>(size, size, null);
    for (let i = 0; i < 4; i++) grid = grid.set({ row: 0, col: i }, "B");
    const s: GomokuState = {
      settings: { boardSize: "9" },
      grid,
      turn: "B",
      winner: null,
      winningLine: null,
      rngSeed: 0,
    };
    const next = reducer(s, { type: "place", at: { row: 0, col: 4 } });
    expect(next.winner).toBe("B");
    expect(next.winningLine).toHaveLength(5);
    expect(isTerminal(next)).toEqual({ score: 100 });
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(42, { boardSize: "9" });
    expect(isTerminal(s)).toBeNull();
  });
});
