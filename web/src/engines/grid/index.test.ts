import { describe, expect, it } from "vitest";
import { Grid, findWinningLine, lineThroughContains, neighbors4, neighbors8 } from "./index.js";

describe("Grid", () => {
  it("constructs and reads", () => {
    const g = Grid.filled(3, 3, 0);
    expect(g.rows).toBe(3);
    expect(g.cols).toBe(3);
    expect(g.get({ row: 1, col: 1 })).toBe(0);
  });
  it("set returns a new grid, original unchanged", () => {
    const g = Grid.filled(2, 2, "a");
    const g2 = g.set({ row: 0, col: 0 }, "b");
    expect(g.get({ row: 0, col: 0 })).toBe("a");
    expect(g2.get({ row: 0, col: 0 })).toBe("b");
  });
  it("inBounds rejects out-of-range", () => {
    const g = Grid.filled(2, 2, 0);
    expect(g.inBounds({ row: -1, col: 0 })).toBe(false);
    expect(g.inBounds({ row: 0, col: 2 })).toBe(false);
  });

  it("neighbors4", () => {
    expect(neighbors4({ row: 1, col: 1 })).toEqual([
      { row: 0, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 },
    ]);
  });

  it("neighbors8 has 8 cells", () => {
    expect(neighbors8({ row: 5, col: 5 })).toHaveLength(8);
  });
});

describe("findWinningLine", () => {
  const isFilled = (v: string) => v !== ".";

  it("detects horizontal 3-in-a-row", () => {
    // row0=X X X, row1=O . ., row2=. . .
    const cells = ["X","X","X","O",".",".",".",".","."];
    const g2 = new Grid(3, 3, cells);
    const line = findWinningLine(g2, 3, isFilled);
    expect(line).not.toBeNull();
    // X-only predicate also finds the top row
    const lineX = findWinningLine(g2, 3, isFilled, (a, b) => a === b && a === "X");
    expect(lineX).not.toBeNull();
    // O-only predicate finds nothing (only one O)
    const lineO = findWinningLine(g2, 3, isFilled, (a, b) => a === b && a === "O");
    expect(lineO).toBeNull();
  });

  it("returns null when no line", () => {
    const g = Grid.filled(3, 3, ".");
    expect(findWinningLine(g, 3, (v) => v !== ".")).toBeNull();
  });

  it("detects diagonal 3-in-a-row", () => {
    const cells = ["X",".",".",".","X",".",".",".","X"];
    const g = new Grid(3, 3, cells);
    const line = findWinningLine(g, 3, (v) => v !== ".");
    expect(line).not.toBeNull();
    expect(line).toHaveLength(3);
  });
});

describe("lineThroughContains", () => {
  it("finds diagonal run of 4", () => {
    const cells = [
      "X",".",".",".",".",
      ".","X",".",".",".",
      ".",".","X",".",".",
      ".",".",".","X",".",
      ".",".",".",".",".",
    ];
    const g = new Grid(5, 5, cells);
    const line = lineThroughContains(g, { row: 2, col: 2 }, 4, (a, b) => a === b);
    expect(line).not.toBeNull();
    expect(line).toHaveLength(4);
  });
});
