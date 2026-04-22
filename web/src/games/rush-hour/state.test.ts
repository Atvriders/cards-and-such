import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, canMove, buildGrid, validateBlocks } from "./state.js";
import { RUSH_PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };
const hard = { difficulty: "hard" as const };

describe("RushHour puzzles", () => {
  it("all puzzles have non-overlapping blocks within the 6×6 grid", () => {
    for (const p of RUSH_PUZZLES) {
      expect(validateBlocks(p.blocks)).toBe(true);
    }
  });

  it("every puzzle has exactly one player block", () => {
    for (const p of RUSH_PUZZLES) {
      const players = p.blocks.filter((b) => b.isPlayer);
      expect(players).toHaveLength(1);
    }
  });

  it("player block is always horizontal in row 2", () => {
    for (const p of RUSH_PUZZLES) {
      const player = p.blocks.find((b) => b.isPlayer)!;
      expect(player.orientation).toBe("h");
      expect(player.row).toBe(2);
    }
  });

  it("has at least 4 easy, 3 medium, 2 hard puzzles", () => {
    expect(RUSH_PUZZLES.filter((p) => p.difficulty === "easy").length).toBeGreaterThanOrEqual(4);
    expect(RUSH_PUZZLES.filter((p) => p.difficulty === "medium").length).toBeGreaterThanOrEqual(3);
    expect(RUSH_PUZZLES.filter((p) => p.difficulty === "hard").length).toBeGreaterThanOrEqual(2);
  });
});

describe("RushHour initialState", () => {
  it("starts with no selection, 0 moves, not won", () => {
    const s = initialState(1, easy);
    expect(s.selected).toBeNull();
    expect(s.moves).toBe(0);
    expect(s.won).toBe(false);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(42, medium);
    const s2 = initialState(42, medium);
    expect(s1.blocks.map((b) => b.id)).toEqual(s2.blocks.map((b) => b.id));
  });
});

describe("RushHour buildGrid", () => {
  it("occupies correct cells for a horizontal block", () => {
    const blocks = [{ id: "a", orientation: "h" as const, row: 1, col: 2, length: 2 as const }];
    const grid = buildGrid(blocks);
    expect(grid.get("1,2")).toBe("a");
    expect(grid.get("1,3")).toBe("a");
    expect(grid.has("1,4")).toBe(false);
  });

  it("occupies correct cells for a vertical block", () => {
    const blocks = [{ id: "b", orientation: "v" as const, row: 0, col: 3, length: 3 as const }];
    const grid = buildGrid(blocks);
    expect(grid.get("0,3")).toBe("b");
    expect(grid.get("1,3")).toBe("b");
    expect(grid.get("2,3")).toBe("b");
    expect(grid.has("3,3")).toBe(false);
  });
});

describe("RushHour canMove", () => {
  it("cannot move when blocked by another block", () => {
    const blocks = [
      { id: "player", orientation: "h" as const, row: 2, col: 0, length: 2 as const, isPlayer: true },
      { id: "a", orientation: "v" as const, row: 1, col: 2, length: 3 as const },
    ];
    // player at col 0-1, block "a" at col 2 — player cannot move right
    expect(canMove(blocks, "player", 1)).toBe(false);
  });

  it("can move when space is available", () => {
    const blocks = [
      { id: "player", orientation: "h" as const, row: 2, col: 0, length: 2 as const, isPlayer: true },
    ];
    expect(canMove(blocks, "player", 1)).toBe(true);
    expect(canMove(blocks, "player", 3)).toBe(true);
    expect(canMove(blocks, "player", 4)).toBe(true);
  });

  it("cannot move off grid", () => {
    const blocks = [
      { id: "player", orientation: "h" as const, row: 2, col: 4, length: 2 as const, isPlayer: true },
    ];
    expect(canMove(blocks, "player", 1)).toBe(false);
  });
});

describe("RushHour reducer", () => {
  it("select action sets selected block id", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "select", id: "player" });
    expect(s2.selected).toBe("player");
  });

  it("move action shifts block position and increments moves", () => {
    const s = initialState(1, easy);
    const player = s.blocks.find((b) => b.id === "player")!;
    const origCol = player.col;
    const s2 = reducer({ ...s, selected: "player" }, { type: "move", id: "player", delta: 1 });
    if (canMove(s.blocks, "player", 1)) {
      expect(s2.moves).toBe(1);
      const p2 = s2.blocks.find((b) => b.id === "player")!;
      expect(p2.col).toBe(origCol + 1);
    }
  });

  it("invalid move does not change state", () => {
    // Place player at right wall
    const s = initialState(1, easy);
    const s2 = { ...s, blocks: s.blocks.map((b) => b.id === "player" ? { ...b, col: 4 } : b) };
    const s3 = reducer(s2, { type: "move", id: "player", delta: 1 });
    expect(s3.moves).toBe(0);
  });

  it("winning move sets won=true", () => {
    const s = initialState(1, easy);
    // Move player to col 4 (filling cols 4+5 = touching right wall = win)
    const s2 = { ...s, blocks: s.blocks.map((b) => b.id === "player" ? { ...b, col: 3 } : b) };
    // Check if col 5 is free; if so, move should win
    if (canMove(s2.blocks, "player", 1)) {
      const s3 = reducer(s2, { type: "move", id: "player", delta: 1 });
      // col 4, length 2 -> covers 4,5 -> won
      expect(s3.won).toBe(true);
    }
  });
});

describe("RushHour isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(1, easy);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 10 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(50, 500 - 10 * 10));
  });

  it("score is at minimum 50", () => {
    const s = initialState(1, hard);
    const wonState = { ...s, won: true, moves: 999 };
    expect(isTerminal(wonState)!.score).toBe(50);
  });
});
