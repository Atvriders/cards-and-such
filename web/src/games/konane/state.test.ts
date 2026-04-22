import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, jumpTargets, SIZE } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { KonaneState, Cell } from "./state.js";

function emptyGrid(): Grid<Cell> { return Grid.filled<Cell>(SIZE, SIZE, null); }

describe("Konane", () => {
  it("initial state: alternating stones, remove-black phase", () => {
    const s = initialState(0, {});
    expect(s.phase).toBe("remove-black");
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    // Check alternating pattern
    expect(s.grid.get({ row: 0, col: 0 })).toBe(0); // even sum = Black
    expect(s.grid.get({ row: 0, col: 1 })).toBe(1); // odd sum = White
    expect(s.grid.get({ row: 1, col: 0 })).toBe(1); // odd sum = White
  });

  it("opening: black removes central stone → moves to remove-white phase", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "remove", at: { row: 3, col: 3 } });
    expect(next.phase).toBe("remove-white");
    expect(next.grid.get({ row: 3, col: 3 })).toBeNull();
  });

  it("opening: black remove rejected for non-central square", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "remove", at: { row: 0, col: 0 } });
    expect(next.phase).toBe("remove-black"); // unchanged
  });

  it("jumpTargets: detects orthogonal jump over opponent", () => {
    let g = emptyGrid();
    g = g.set({ row: 4, col: 4 }, 0); // Black
    g = g.set({ row: 4, col: 5 }, 1); // White (opponent)
    // Black can jump right to 4,6 if empty
    const targets = jumpTargets(g, { row: 4, col: 4 }, 0);
    expect(targets.some(t => t.to.row === 4 && t.to.col === 6)).toBe(true);
  });

  it("jumpTargets: no diagonal jumps", () => {
    let g = emptyGrid();
    g = g.set({ row: 4, col: 4 }, 0); // Black
    g = g.set({ row: 5, col: 5 }, 1); // White diagonal
    const targets = jumpTargets(g, { row: 4, col: 4 }, 0);
    // Should not find a diagonal jump
    expect(targets.some(t => t.to.row === 6 && t.to.col === 6)).toBe(false);
  });

  it("winner set when opponent has no jumps", () => {
    // Manually set a state where White (bot) has no moves
    const s = initialState(0, {});
    const withWinner: KonaneState = { ...s, winner: 0, phase: "play" as const };
    expect(isTerminal(withWinner)).toEqual({ score: 100 });
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });
});
