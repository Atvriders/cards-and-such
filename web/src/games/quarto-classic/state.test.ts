import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWinner, pieceAttrs } from "./state.js";

const S = { botStrength: "easy" as const };

describe("quarto-classic", () => {
  it("starts with 16 cells and a piece to place", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(16);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.toPlace).not.toBeNull();
    expect(s.remaining.length).toBe(15);
  });

  it("place transitions to choose phase", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", cell: 0 });
    expect(s1.board[0]).toBe(s0.toPlace);
    expect(s1.phase).toBe("choose");
  });

  it("checkWinner detects 4 tall pieces in a row", () => {
    const board = Array(16).fill(null) as (number | null)[];
    // Place 4 tall pieces (bit 8 set) in row 0
    board[0] = 0b1000;
    board[1] = 0b1010;
    board[2] = 0b1100;
    board[3] = 0b1111;
    expect(checkWinner(board).winner).toBe(true);
  });

  it("pieceAttrs decodes the 4 bits", () => {
    const a = pieceAttrs(0b1010);
    expect(a.tall).toBe(true);
    expect(a.light).toBe(false);
    expect(a.square).toBe(true);
    expect(a.solid).toBe(false);
  });

  it("isTerminal null while game in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
