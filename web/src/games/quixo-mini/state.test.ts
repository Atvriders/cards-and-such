import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, applyPush, edgeCells, validDirs, checkWinner, SIZE } from "./state.js";

const S = { botStrength: "easy" as const };

describe("quixo-mini", () => {
  it("starts with empty 4×4 grid", () => {
    const s = initialState(1, S);
    expect(s.grid.length).toBe(SIZE * SIZE);
    expect(s.grid.every((c) => c === null)).toBe(true);
    expect(s.gameOver).toBe(false);
  });

  it("edgeCells returns the correct count for 4×4", () => {
    expect(edgeCells().length).toBe(12); // 16 - 4 inner cells
  });

  it("applyPush slides correctly to the right", () => {
    const grid = Array(SIZE * SIZE).fill(null);
    grid[0] = "X"; grid[1] = "O"; grid[2] = "O"; grid[3] = null;
    // push (0,0) right: (0,0) becomes (0,1) value, (0,1)→(0,2), ..., (0,SIZE-1) = mark
    const next = applyPush(grid, 0, "right", "X");
    expect(next[3]).toBe("X");
  });

  it("validDirs for top-left corner has only right and down", () => {
    const dirs = validDirs(0);
    expect(dirs).toContain("right");
    expect(dirs).toContain("down");
    expect(dirs).not.toContain("left");
    expect(dirs).not.toContain("up");
  });

  it("checkWinner detects a row of 4", () => {
    const g = Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < 4; c++) g[c] = "X";
    expect(checkWinner(g).winner).toBe("X");
  });

  it("isTerminal null on fresh game", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
