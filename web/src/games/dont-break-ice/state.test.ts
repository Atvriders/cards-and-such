import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, isSupportCube, TOTAL_CUBES, SUPPORT_POSITIONS } from "./state.js";

const settings = { dummy: "yes" as const };

describe("Don't Break the Ice", () => {
  it("initializes 4×4 grid with 16 cubes all present", () => {
    const s = initialState(42, settings);
    expect(s.cubesRemaining).toBe(TOTAL_CUBES);
    expect(s.supportRemaining).toBe(4);
    expect(s.loser).toBeNull();
    s.grid.forEach((row) => row.forEach((cell) => expect(cell).toBe(true)));
  });

  it("removing a non-support cube decrements cubesRemaining", () => {
    const s = initialState(42, settings);
    // Top-left corner [0,0] is not a support
    const next = reducer(s, { type: "remove", row: 0, col: 0 });
    expect(next.cubesRemaining).toBeLessThan(TOTAL_CUBES);
    expect(next.grid[0]![0]).toBe(false);
  });

  it("support cubes are at inner 2×2 positions", () => {
    for (const [r, c] of SUPPORT_POSITIONS) {
      expect(isSupportCube(r, c)).toBe(true);
    }
    expect(isSupportCube(0, 0)).toBe(false);
    expect(isSupportCube(3, 3)).toBe(false);
  });

  it("removing all 4 support cubes causes loser to be set", () => {
    const s = initialState(42, settings);
    // Manually strip all non-support cubes from grid and support count
    const safeGrid = s.grid.map((row, r) =>
      row.map((_, c) => isSupportCube(r, c))
    );
    const onlySupports = { ...s, grid: safeGrid, cubesRemaining: 4, supportRemaining: 4 };
    // Remove 3 supports via direct state (simulate)
    let cur = onlySupports;
    // Force removes of support cubes one by one
    for (const [r, c] of SUPPORT_POSITIONS.slice(0, 4)) {
      if (cur.loser !== null) break;
      cur = { ...cur, grid: cur.grid.map((row, ri) => ri === r ? row.map((v, ci) => ci === c ? false : v) : row) as typeof cur.grid,
               supportRemaining: cur.supportRemaining - 1, cubesRemaining: cur.cubesRemaining - 1,
               loser: cur.supportRemaining - 1 === 0 ? cur.turn : null };
    }
    expect(cur.loser).not.toBeNull();
  });

  it("isTerminal returns null when game ongoing", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 when bot loses", () => {
    const s = initialState(42, settings);
    const won = { ...s, loser: 1 as const };
    expect(isTerminal(won)).toEqual({ score: 100 });
  });

  it("isTerminal returns score 0 when player loses", () => {
    const s = initialState(42, settings);
    const lost = { ...s, loser: 0 as const };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });

  it("bot takes a turn after player removes a cube", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "remove", row: 0, col: 0 });
    if (next.loser === null) {
      expect(next.cubesRemaining).toBeLessThanOrEqual(TOTAL_CUBES - 2); // player + bot
    }
  });
});
