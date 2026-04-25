import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("PentominoPuzzle initialState", () => {
  it("creates a 5x4 grid (easy)", () => {
    const s = initialState(0, easy);
    expect(s.cols).toBe(5);
    expect(s.rows).toBe(4);
    expect(s.grid).toHaveLength(20);
  });

  it("all grid cells start empty", () => {
    const s = initialState(0, easy);
    expect(s.grid.every(v => v === -1)).toBe(true);
  });

  it("has 4 pieces for easy", () => {
    const s = initialState(0, easy);
    expect(s.pieces).toHaveLength(4);
  });

  it("hard difficulty provides 6 pieces", () => {
    const s = initialState(0, hard);
    expect(s.pieces).toHaveLength(6);
  });
});

describe("PentominoPuzzle reducer", () => {
  it("selects a piece", () => {
    const s = initialState(0, easy);
    const s2 = reducer(s, { type: "selectPiece", pieceId: 1 });
    expect(s2.selectedPiece).toBe(1);
  });

  it("places selected piece on empty cells", () => {
    const s = initialState(0, easy);
    // Piece 0 is I_H (1x5 horizontal), should fit at col=0, row=0 on 5x4 grid
    const s2 = reducer(s, { type: "selectPiece", pieceId: 0 });
    const s3 = reducer(s2, { type: "placePiece", col: 0, row: 0 });
    expect(s3.pieces[0]?.placed).toBe(true);
    expect(s3.moves).toBe(1);
    // All 5 cells of top row should be filled with piece 0
    for (let c = 0; c < 5; c++) {
      expect(s3.grid[c]).toBe(0);
    }
  });

  it("cannot place piece out of bounds", () => {
    const s = initialState(0, easy);
    // I_H (1x5) at col=2 would go out of bounds
    const s2 = reducer(s, { type: "selectPiece", pieceId: 0 });
    const s3 = reducer(s2, { type: "placePiece", col: 2, row: 0 });
    expect(s3.pieces[0]?.placed).toBe(false);
  });

  it("removes a placed piece", () => {
    const s = initialState(0, easy);
    const s2 = reducer(s, { type: "selectPiece", pieceId: 0 });
    const s3 = reducer(s2, { type: "placePiece", col: 0, row: 0 });
    expect(s3.pieces[0]?.placed).toBe(true);
    const s4 = reducer(s3, { type: "removePiece", col: 0, row: 0 });
    expect(s4.pieces[0]?.placed).toBe(false);
    expect(s4.grid[0]).toBe(-1);
  });

  it("no-op when won", () => {
    const s = { ...initialState(0, easy), won: true };
    const s2 = reducer(s, { type: "selectPiece", pieceId: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(0, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(0, easy), won: true, moves: 8 };
    const r = isTerminal(s);
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThanOrEqual(50);
  });
});
