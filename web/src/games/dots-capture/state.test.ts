import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, countCaptured, countDots } from "./state.js";
import type { DotsCaptureState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("DotsCapture initialState", () => {
  it("starts with empty 7x7 grid", () => {
    const s = initialState(1, settings);
    expect(s.grid.rows).toBe(7);
    expect(s.grid.cols).toBe(7);
    for (const c of s.grid.coords()) expect(s.grid.get(c)).toBeNull();
  });

  it("starts with 20 turns", () => {
    const s = initialState(1, settings);
    expect(s.turnsLeft).toBe(20);
  });

  it("white moves first", () => {
    expect(initialState(1, settings).turn).toBe("W");
  });
});

describe("DotsCapture placement", () => {
  it("placing a dot reduces turns and changes turn", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    expect(next.grid.get({ row: 0, col: 0 })).toBe("W");
    expect(next.turnsLeft).toBe(19);
    expect(next.turn).toBe("B");
  });

  it("cannot place on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    const before = s2.grid;
    const s3 = reducer(s2, { type: "place", at: { row: 0, col: 0 } });
    expect(s3.grid).toBe(before);
  });
});

describe("DotsCapture scoring", () => {
  it("captures surrounded dot correctly", () => {
    // W dot at (1,1) surrounded by B on all 4 sides
    const cells: Cell[] = new Array(49).fill(null);
    cells[1 * 7 + 1] = "W";
    cells[0 * 7 + 1] = "B";
    cells[2 * 7 + 1] = "B";
    cells[1 * 7 + 0] = "B";
    cells[1 * 7 + 2] = "B";
    const grid = new Grid<Cell>(7, 7, cells);
    expect(countCaptured(grid, "W")).toBe(1);
    expect(countCaptured(grid, "B")).toBe(0);
  });

  it("corner dot with 2 OOB and 2 opponent neighbors is captured", () => {
    const cells: Cell[] = new Array(49).fill(null);
    cells[0] = "W"; // (0,0) corner
    cells[1] = "B"; // (0,1)
    cells[7] = "B"; // (1,0)
    const grid = new Grid<Cell>(7, 7, cells);
    expect(countCaptured(grid, "W")).toBe(1);
  });

  it("game ends after 20 turns with a winner", () => {
    let s = initialState(1, settings);
    for (let i = 0; i < 20; i++) {
      // Find empty cell and place
      for (const c of s.grid.coords()) {
        if (s.grid.get(c) === null) {
          s = reducer(s, { type: "place", at: c });
          break;
        }
      }
    }
    expect(s.winner).not.toBeNull();
    const term = isTerminal(s);
    expect(term).not.toBeNull();
  });
});
