import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, SIZE } from "./state.js";
import type { Color } from "./state.js";

describe("Painting Puzzle", () => {
  it("initializes with correct size grid", () => {
    const s = initialState(1);
    expect(s.grid.length).toBe(SIZE);
    expect(s.grid[0]!.length).toBe(SIZE);
    expect(s.phase).toBe("playing");
    expect(s.moves).toBe(0);
  });

  it("locked cells cannot be changed", () => {
    const s = initialState(1);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (s.locked[r]![c]) {
          const before = s.grid[r]![c];
          const s2 = reducer(s, { type: "cycleColor", row: r, col: c });
          expect(s2.grid[r]![c]).toBe(before);
          return;
        }
      }
    }
  });

  it("cycling an unlocked cell changes its color", () => {
    const s = initialState(2);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!s.locked[r]![c]) {
          const before = s.grid[r]![c];
          const s2 = reducer(s, { type: "cycleColor", row: r, col: c });
          expect(s2.grid[r]![c]).not.toBe(before);
          expect(s2.moves).toBe(1);
          return;
        }
      }
    }
  });

  it("cycling past 4 wraps to 0", () => {
    const s = initialState(3);
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!s.locked[r]![c]) {
          // set to 4 then cycle
          const s4 = { ...s, grid: s.grid.map((row, ri) => row.map((col, ci) => ri === r && ci === c ? 4 as Color : col)) };
          const s2 = reducer(s4, { type: "cycleColor", row: r, col: c });
          expect(s2.grid[r]![c]).toBe(0);
          return;
        }
      }
    }
  });

  it("reset increments puzzleIndex", () => {
    const s = initialState(5);
    const s2 = reducer(s, { type: "reset" });
    expect(s2.puzzleIndex).toBe(1);
    expect(s2.phase).toBe("playing");
  });

  it("isTerminal returns null while playing", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score on won", () => {
    const s = initialState(1);
    const result = isTerminal({ ...s, phase: "won", moves: 10 });
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("has some locked cells pre-filled", () => {
    const s = initialState(7);
    const lockedCount = s.locked.flat().filter(Boolean).length;
    expect(lockedCount).toBeGreaterThanOrEqual(6);
  });
});
