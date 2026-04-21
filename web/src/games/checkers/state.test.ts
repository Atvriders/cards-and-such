import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";
import type { CheckersState, CheckersSettings, Piece } from "./state.js";
import { Grid } from "../../engines/grid/index.js";

const defaultSettings: CheckersSettings = {
  mandatoryCapture: true,
  opponent: "hot-seat",
  botDepth: "2",
};

function countPieces(grid: Grid<Piece | null>, color: "red" | "black"): number {
  let count = 0;
  for (const c of grid.coords()) {
    const p = grid.get(c);
    if (p && p.color === color) count++;
  }
  return count;
}

describe("Checkers initialState", () => {
  it("has 12 red and 12 black pieces on dark squares", () => {
    const s = initialState(42, defaultSettings);
    expect(countPieces(s.grid, "red")).toBe(12);
    expect(countPieces(s.grid, "black")).toBe(12);

    // All pieces on dark squares (row+col odd)
    for (const c of s.grid.coords()) {
      const p = s.grid.get(c);
      if (p !== null) {
        expect((c.row + c.col) % 2).toBe(1);
      }
    }

    // Red in rows 5-7, black in rows 0-2
    for (const c of s.grid.coords()) {
      const p = s.grid.get(c);
      if (p?.color === "red") expect(c.row).toBeGreaterThanOrEqual(5);
      if (p?.color === "black") expect(c.row).toBeLessThanOrEqual(2);
    }
  });

  it("red moves first", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe("red");
  });
});

describe("Checkers reducer", () => {
  it("simple diagonal move works for red piece", () => {
    // Place single red piece at (5,0), no black nearby
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[5 * 8 + 0] = { color: "red", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    // Red moves from (5,0) to (4,1)
    const s2 = reducer(s, { type: "move", from: { row: 5, col: 0 }, to: { row: 4, col: 1 } });
    expect(s2.grid.get({ row: 5, col: 0 })).toBeNull();
    expect(s2.grid.get({ row: 4, col: 1 })).toEqual({ color: "red", king: false });
    expect(s2.turn).toBe("black"); // turn flipped
  });

  it("illegal move (sideways) is rejected", () => {
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[5 * 8 + 1] = { color: "red", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    // Red tries to move sideways
    const s2 = reducer(s, { type: "move", from: { row: 5, col: 1 }, to: { row: 5, col: 2 } });
    expect(s2).toBe(s); // state unchanged (same reference)
  });

  it("illegal move onto own piece is rejected", () => {
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[5 * 8 + 1] = { color: "red", king: false };
    cells[4 * 8 + 2] = { color: "red", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    const s2 = reducer(s, { type: "move", from: { row: 5, col: 1 }, to: { row: 4, col: 2 } });
    expect(s2).toBe(s);
  });

  it("jump capture removes captured piece and moves attacker", () => {
    // Red at (4,1), black at (3,2), landing at (2,3)
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[4 * 8 + 1] = { color: "red", king: false };
    cells[3 * 8 + 2] = { color: "black", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    const s2 = reducer(s, { type: "move", from: { row: 4, col: 1 }, to: { row: 2, col: 3 } });
    expect(s2.grid.get({ row: 4, col: 1 })).toBeNull();
    expect(s2.grid.get({ row: 3, col: 2 })).toBeNull(); // captured
    expect(s2.grid.get({ row: 2, col: 3 })).toEqual({ color: "red", king: false });
  });

  it("chained jumps: mustContinueFrom set when more jumps available after capture", () => {
    // Red at (6,1), black at (5,2), black at (3,4)
    // Red can jump (6,1)->(4,3) capturing (5,2), then (4,3)->(2,5) capturing (3,4)
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[6 * 8 + 1] = { color: "red", king: false };
    cells[5 * 8 + 2] = { color: "black", king: false };
    cells[3 * 8 + 4] = { color: "black", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    // The getLegalMoves should return the full chain move
    const legalMoves = getLegalMoves(s.grid, "red", true, null);
    // Should find the double jump
    const doubleJump = legalMoves.find((m) => m.captures.length === 2);
    expect(doubleJump).toBeDefined();
    // Now apply it in one move
    const s2 = reducer(s, { type: "move", from: { row: 6, col: 1 }, to: { row: 2, col: 5 } });
    expect(s2.grid.get({ row: 5, col: 2 })).toBeNull();
    expect(s2.grid.get({ row: 3, col: 4 })).toBeNull();
    expect(s2.grid.get({ row: 2, col: 5 })).toEqual({ color: "red", king: false });
    expect(s2.turn).toBe("black"); // full chain done, turn flips
  });

  it("king promotion on reaching last row", () => {
    // Red at (1,0), no obstacles, step to (0,1)
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[1 * 8 + 0] = { color: "red", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    const s2 = reducer(s, { type: "move", from: { row: 1, col: 0 }, to: { row: 0, col: 1 } });
    const promoted = s2.grid.get({ row: 0, col: 1 });
    expect(promoted).toEqual({ color: "red", king: true });
  });

  it("win detection when opponent has no pieces", () => {
    // Only red pieces, no black — but we need to trigger via a final capture
    // Red at (2,1), black at (1,2), land at (0,3) — removes last black piece
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[2 * 8 + 1] = { color: "red", king: false };
    cells[1 * 8 + 2] = { color: "black", king: false };
    const s: CheckersState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    const s2 = reducer(s, { type: "move", from: { row: 2, col: 1 }, to: { row: 0, col: 3 } });
    expect(s2.winner).toBe("red");
  });

  it("mandatory capture: non-jump moves rejected when jump available", () => {
    // Red at (4,1), black at (3,2) — jump is available
    // Try to make a non-jump move to (3,0)
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[4 * 8 + 1] = { color: "red", king: false };
    cells[3 * 8 + 2] = { color: "black", king: false };
    const s: CheckersState = {
      settings: { ...defaultSettings, mandatoryCapture: true },
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "red",
      selected: null,
      mustContinueFrom: null,
      winner: null,
      movesWithoutCapture: 0,
    };
    // Legal moves should only be jumps
    const legal = getLegalMoves(s.grid, "red", true, null);
    expect(legal.every((m) => m.captures.length > 0)).toBe(true);

    // Moving to (3,0) (non-jump) should be rejected by reducer
    const s2 = reducer(s, { type: "move", from: { row: 4, col: 1 }, to: { row: 3, col: 0 } });
    expect(s2).toBe(s);
  });
});

describe("Checkers isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score based on remaining pieces on red win", () => {
    // 3 red pieces, bot mode
    const cells: (Piece | null)[] = new Array(64).fill(null);
    cells[7 * 8 + 1] = { color: "red", king: false };
    cells[7 * 8 + 3] = { color: "red", king: false };
    cells[7 * 8 + 5] = { color: "red", king: false };
    const s: CheckersState = {
      settings: { ...defaultSettings, opponent: "bot" },
      rngSeed: 1,
      grid: new Grid<Piece | null>(8, 8, cells),
      turn: "black",
      selected: null,
      mustContinueFrom: null,
      winner: "red",
      movesWithoutCapture: 0,
    };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(30); // 3 pieces * 10
  });
});
