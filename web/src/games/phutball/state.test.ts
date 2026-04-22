import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canJump } from "./state.js";
import type { PhutballState } from "./state.js";
import { Grid } from "../../engines/grid/index.js";
import type { Cell } from "./state.js";

const settings = { opponent: "hot-seat" as const };

describe("Phutball initialState", () => {
  it("ball starts at center (3,4)", () => {
    const s = initialState(1, settings);
    expect(s.ballPos).toEqual({ row: 3, col: 4 });
    expect(s.grid.get({ row: 3, col: 4 })).toBe("ball");
  });

  it("grid is 7x9", () => {
    const s = initialState(1, settings);
    expect(s.grid.rows).toBe(7);
    expect(s.grid.cols).toBe(9);
  });

  it("white moves first", () => {
    expect(initialState(1, settings).turn).toBe("W");
  });
});

describe("Phutball placeman", () => {
  it("places man on empty cell and changes turn", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "placeman", at: { row: 0, col: 0 } });
    expect(next.grid.get({ row: 0, col: 0 })).toBe("man");
    expect(next.turn).toBe("B");
  });

  it("cannot place on ball cell", () => {
    const s = initialState(1, settings);
    const before = s.grid;
    const next = reducer(s, { type: "placeman", at: s.ballPos });
    expect(next.grid).toBe(before);
  });
});

describe("Phutball jump", () => {
  it("canJump returns true when men are in direction", () => {
    const cells: Cell[] = new Array(63).fill(null);
    cells[3 * 9 + 4] = "ball";
    cells[2 * 9 + 4] = "man";
    const grid = new Grid<Cell>(7, 9, cells);
    expect(canJump(grid, { row: 3, col: 4 }, -1, 0)).toBe(true);
  });

  it("canJump returns false when no men in direction", () => {
    const s = initialState(1, settings);
    expect(canJump(s.grid, s.ballPos, -1, 0)).toBe(false);
  });

  it("jump moves ball and removes men", () => {
    const cells: Cell[] = new Array(63).fill(null);
    cells[3 * 9 + 4] = "ball";
    cells[2 * 9 + 4] = "man";
    const state: PhutballState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(7, 9, cells),
      turn: "W",
      ballPos: { row: 3, col: 4 },
      winner: null,
      jumpInProgress: false,
    };
    const next = reducer(state, { type: "jump", direction: [-1, 0] });
    // Ball should be at row 1, col 4; man at row 2 removed
    expect(next.ballPos).toEqual({ row: 1, col: 4 });
    expect(next.grid.get({ row: 2, col: 4 })).toBeNull();
    expect(next.grid.get({ row: 1, col: 4 })).toBe("ball");
  });

  it("jump past top edge wins for W", () => {
    const cells: Cell[] = new Array(63).fill(null);
    cells[1 * 9 + 4] = "ball";
    cells[0 * 9 + 4] = "man";
    const state: PhutballState = {
      settings,
      rngSeed: 1,
      grid: new Grid<Cell>(7, 9, cells),
      turn: "W",
      ballPos: { row: 1, col: 4 },
      winner: null,
      jumpInProgress: false,
    };
    const next = reducer(state, { type: "jump", direction: [-1, 0] });
    expect(next.winner).toBe("W");
  });
});
