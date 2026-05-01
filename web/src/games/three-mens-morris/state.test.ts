import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkLineWin, ADJACENCY, LINES, POINTS, PIECES_PER } from "./state.js";

const S = { botStrength: "easy" as const };

describe("Three Men's Morris", () => {
  it("starts placing with 3 pieces each, 9 intersections", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(POINTS);
    expect(s.piecesToPlace).toEqual([PIECES_PER, PIECES_PER]);
    expect(s.phase).toEqual(["placing", "placing"]);
    expect(s.winner).toBeNull();
  });

  it("placing a piece reduces toPlace count", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", pos: 4 });
    expect(s1.board[4]).toBe(0);
    expect(s1.piecesToPlace[0]).toBe(PIECES_PER - 1);
  });

  it("ADJACENCY has 9 entries; center connects to all 8 others", () => {
    expect(ADJACENCY.length).toBe(POINTS);
    expect(ADJACENCY[4]!.length).toBe(8);
  });

  it("LINES contains 8 winning lines (3 rows + 3 cols + 2 diags)", () => {
    expect(LINES.length).toBe(8);
  });

  it("checkLineWin detects a row of 3", () => {
    const board: (0 | 1 | null)[] = new Array(POINTS).fill(null);
    board[0] = 0; board[1] = 0; board[2] = 0;
    expect(checkLineWin(board).winner).toBe(0);
  });

  it("isTerminal null while in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
