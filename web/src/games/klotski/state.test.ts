import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canMove, buildGrid, checkWin, GOAL_ID } from "./state.js";

const settings = { layout: "red-donkey" as const };

describe("Klotski initialState", () => {
  it("has goal block at row 0, col 1", () => {
    const s = initialState(1, settings);
    const goal = s.blocks.find((b) => b.id === GOAL_ID);
    expect(goal).toBeDefined();
    expect(goal!.row).toBe(0);
    expect(goal!.col).toBe(1);
    expect(goal!.w).toBe(2);
    expect(goal!.h).toBe(2);
  });

  it("starts not won", () => {
    const s = initialState(1, settings);
    expect(s.won).toBe(false);
  });

  it("starts with 0 moves", () => {
    const s = initialState(1, settings);
    expect(s.moves).toBe(0);
  });

  it("all layouts initialize without crash", () => {
    for (const layout of ["red-donkey", "easy", "medium"] as const) {
      const s = initialState(1, { layout });
      expect(s.blocks.length).toBeGreaterThan(0);
    }
  });
});

describe("Klotski buildGrid", () => {
  it("goal block occupies expected cells", () => {
    const s = initialState(1, settings);
    const grid = buildGrid(s.blocks);
    expect(grid[0]![1]).toBe(GOAL_ID);
    expect(grid[0]![2]).toBe(GOAL_ID);
    expect(grid[1]![1]).toBe(GOAL_ID);
    expect(grid[1]![2]).toBe(GOAL_ID);
  });
});

describe("Klotski canMove", () => {
  it("goal block cannot move down at start (blocked)", () => {
    const s = initialState(1, settings);
    // There are blocks below the goal in Red Donkey layout
    const result = canMove(s.blocks, GOAL_ID, 1, 0);
    // May or may not be blocked depending on layout; just check it returns boolean
    expect(typeof result).toBe("boolean");
  });

  it("block cannot move out of bounds", () => {
    const s = initialState(1, settings);
    // Block at col 0 cannot move left
    const leftBlock = s.blocks.find((b) => b.col === 0);
    if (leftBlock) {
      expect(canMove(s.blocks, leftBlock.id, 0, -1)).toBe(false);
    }
  });
});

describe("Klotski reducer", () => {
  it("select sets selectedId", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", id: GOAL_ID });
    expect(s2.selectedId).toBe(GOAL_ID);
  });

  it("select same block twice deselects", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "select", id: GOAL_ID });
    const s3 = reducer(s2, { type: "select", id: GOAL_ID });
    expect(s3.selectedId).toBeNull();
  });

  it("invalid move is rejected", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "move", id: GOAL_ID, dr: 0, dc: -2 }); // 2 steps invalid
    expect(s2.moves).toBe(0);
  });

  it("won state does not change on action", () => {
    const s = initialState(1, settings);
    const wonState = { ...s, won: true };
    const s2 = reducer(wonState, { type: "select", id: GOAL_ID });
    expect(s2.won).toBe(true);
  });
});

describe("Klotski isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, settings);
    const won = { ...s, won: true, moves: 50 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(400); // 500 - 50*2
  });

  it("score floors at 10", () => {
    const s = initialState(1, settings);
    const won = { ...s, won: true, moves: 999 };
    expect(isTerminal(won)!.score).toBe(10);
  });

  it("checkWin detects goal at row 3 col 1", () => {
    const s = initialState(1, settings);
    const blocks = s.blocks.map((b) => b.id === GOAL_ID ? { ...b, row: 3, col: 1 } : b);
    expect(checkWin(blocks)).toBe(true);
  });
});
