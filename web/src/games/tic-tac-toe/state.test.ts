import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TTTState, TTTSettings } from "./state.js";
import { Grid } from "../../engines/grid/index.js";

const defaultSettings: TTTSettings = {
  boardSize: "3",
  winLength: "3",
  opponent: "bot",
  botStrength: "hard",
};

const hotSeatSettings: TTTSettings = {
  ...defaultSettings,
  opponent: "hot-seat",
};

describe("TicTacToe initialState", () => {
  it("starts with empty 3x3 grid and X to move", () => {
    const s = initialState(42, defaultSettings);
    expect(s.turn).toBe("X");
    expect(s.winner).toBeNull();
    expect(s.grid.rows).toBe(3);
    expect(s.grid.cols).toBe(3);
    for (const c of s.grid.coords()) {
      expect(s.grid.get(c)).toBeNull();
    }
  });
});

describe("TicTacToe reducer", () => {
  it("placing on empty cell changes grid and (bot plays immediately so turn stays X)", () => {
    const s = initialState(42, defaultSettings);
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    expect(s2.grid.get({ row: 0, col: 0 })).toBe("X");
    // Bot plays so turn returns to X (unless game over)
    if (s2.winner === null) {
      expect(s2.turn).toBe("X");
    }
  });

  it("placing on empty cell in hot-seat changes turn from X to O", () => {
    const s = initialState(42, hotSeatSettings);
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 0 } });
    expect(s2.grid.get({ row: 0, col: 0 })).toBe("X");
    expect(s2.turn).toBe("O");
  });

  it("placing on occupied cell is rejected", () => {
    let s = initialState(42, hotSeatSettings);
    s = reducer(s, { type: "place", at: { row: 1, col: 1 } });
    expect(s.grid.get({ row: 1, col: 1 })).toBe("X");
    const s2 = reducer(s, { type: "place", at: { row: 1, col: 1 } });
    // Should be same as s (no change)
    expect(s2.grid.get({ row: 1, col: 1 })).toBe("X");
    expect(s2.turn).toBe("O"); // still O's turn
  });

  it("detects win when 3 in a row for X", () => {
    // Set up a state manually with X winning
    const cells: ("X" | "O" | null)[] = [
      "X", "X", null,
      "O", "O", null,
      null, null, null,
    ];
    const grid = new Grid<"X" | "O" | null>(3, 3, cells);
    const s: TTTState = {
      settings: hotSeatSettings,
      rngSeed: 1,
      grid,
      turn: "X",
      winner: null,
      winningLine: null,
    };
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 2 } });
    expect(s2.winner).toBe("X");
    expect(s2.winningLine).not.toBeNull();
    expect(s2.winningLine?.length).toBe(3);
  });

  it("detects draw when board is full and no winner", () => {
    // X O X / X X O / O X O — no winner (all cells full)
    const cells: ("X" | "O" | null)[] = [
      "X", "O", "X",
      "X", "X", "O",
      "O", null, "O",
    ];
    const grid = new Grid<"X" | "O" | null>(3, 3, cells);
    const s: TTTState = {
      settings: hotSeatSettings,
      rngSeed: 1,
      grid,
      turn: "X",
      winner: null,
      winningLine: null,
    };
    const s2 = reducer(s, { type: "place", at: { row: 2, col: 1 } });
    expect(s2.winner).toBe("draw");
  });

  it("detects 4-in-a-row on a 5x5 board with winLength 4", () => {
    const settings5: TTTSettings = {
      boardSize: "5",
      winLength: "4",
      opponent: "hot-seat",
      botStrength: "easy",
    };
    // Build a 5x5 state with X about to complete 4 in a row on row 0
    const cells = new Array(25).fill(null) as (null | "X" | "O")[];
    // X at (0,0), (0,1), (0,2), need (0,3)
    cells[0] = "X";
    cells[1] = "X";
    cells[2] = "X";
    // O pieces somewhere else
    cells[5] = "O";
    cells[6] = "O";
    cells[7] = "O";
    const grid = new Grid<"X" | "O" | null>(5, 5, cells);
    const s: TTTState = {
      settings: settings5,
      rngSeed: 1,
      grid,
      turn: "X",
      winner: null,
      winningLine: null,
    };
    const s2 = reducer(s, { type: "place", at: { row: 0, col: 3 } });
    expect(s2.winner).toBe("X");
    expect(s2.winningLine?.length).toBe(4);
  });
});

describe("TicTacToe isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 10 on win vs bot", () => {
    const cells: ("X" | "O" | null)[] = [
      "X", "X", "X",
      "O", "O", null,
      null, null, null,
    ];
    const s: TTTState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: new Grid<"X" | "O" | null>(3, 3, cells),
      turn: "O",
      winner: "X",
      winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    };
    expect(isTerminal(s)?.score).toBe(10);
  });

  it("returns score 5 on draw vs bot", () => {
    const s: TTTState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: Grid.filled<"X" | "O" | null>(3, 3, null),
      turn: "X",
      winner: "draw",
      winningLine: null,
    };
    expect(isTerminal(s)?.score).toBe(5);
  });

  it("returns score 0 on loss vs bot", () => {
    const s: TTTState = {
      settings: defaultSettings,
      rngSeed: 1,
      grid: Grid.filled<"X" | "O" | null>(3, 3, null),
      turn: "X",
      winner: "O",
      winningLine: null,
    };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
