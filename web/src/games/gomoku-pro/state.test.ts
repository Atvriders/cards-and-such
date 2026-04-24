import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, isForbiddenCell, SIZE } from "./state.js";
import type { GomokuProSettings, GomokuProState } from "./state.js";

const settings: GomokuProSettings = { opponent: "bot" };

describe("GomokuPro initialState", () => {
  it("starts with empty 15×15 board", () => {
    const s = initialState(1, settings);
    expect(s.board.length).toBe(SIZE * SIZE);
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("starts black's turn with no winner", () => {
    const s = initialState(1, settings);
    expect(s.turn).toBe("black");
    expect(s.winner).toBeNull();
  });
});

describe("GomokuPro checkWin", () => {
  it("detects 5 in a row for black", () => {
    const board = new Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < 5; c++) {
      board[c] = "black";
    }
    board[4] = "black";
    const line = checkWin(board, 4, "black");
    expect(line).not.toBeNull();
    expect(line!.length).toBe(5);
  });

  it("does not detect 6 in a row for black (overline)", () => {
    const board = new Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < 6; c++) {
      board[c] = "black";
    }
    // Black cannot win with 6
    const line = checkWin(board, 5, "black");
    expect(line).toBeNull();
  });

  it("detects 5+ in a row for white", () => {
    const board = new Array(SIZE * SIZE).fill(null);
    for (let c = 0; c < 6; c++) {
      board[c] = "white";
    }
    const line = checkWin(board, 5, "white");
    expect(line).not.toBeNull();
  });
});

describe("GomokuPro isForbiddenCell", () => {
  it("returns false for a simple opening move", () => {
    const s = initialState(1, settings);
    expect(isForbiddenCell(s.board, 7 * SIZE + 7)).toBe(false);
  });
});

describe("GomokuPro reducer", () => {
  it("places black stone on empty cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", pos: 7 * SIZE + 7 });
    expect(s2.board[7 * SIZE + 7]).toBe("black");
  });

  it("ignores place on occupied cell", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "place", pos: 7 * SIZE + 7 });
    const s3 = reducer(s2, { type: "place", pos: 7 * SIZE + 7 });
    expect(s3.board[7 * SIZE + 7]).toBe("black");
    expect(s3.turn).toBe("black"); // back to black after bot moves
  });
});

describe("GomokuPro isTerminal", () => {
  it("returns null when game is not over", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score 30 on black win", () => {
    const s: GomokuProState = { ...initialState(1, settings), winner: "black" };
    expect(isTerminal(s)?.score).toBe(30);
  });

  it("returns score 0 on white win", () => {
    const s: GomokuProState = { ...initialState(1, settings), winner: "white" };
    expect(isTerminal(s)?.score).toBe(0);
  });
});
