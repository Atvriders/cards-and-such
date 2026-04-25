import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, BOARD, BASE_PIECES, getShape, canPlace } from "./state.js";

describe("Cathedral", () => {
  it("starts with cathedral placed and player 0 turn", () => {
    const s = initialState(0, {});
    const cathedralCells = s.board.filter((c) => c === "cathedral").length;
    expect(cathedralCells).toBe(5);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.p0Pieces.length).toBe(BASE_PIECES.length);
    expect(s.p1Pieces.length).toBe(BASE_PIECES.length);
  });

  it("can place a piece on empty cells", () => {
    const board = new Array(BOARD * BOARD).fill(null);
    const shape = getShape(0, 0); // i2 piece
    expect(canPlace(board, shape, 0, 0, "p0")).toBe(true);
  });

  it("cannot place a piece on occupied cells", () => {
    const s = initialState(0, {});
    // Cathedral occupies center, try to place there
    const shape = getShape(0, 0);
    // find a cathedral cell
    const catIdx = s.board.indexOf("cathedral");
    const catR = Math.floor(catIdx / BOARD);
    const catC = catIdx % BOARD;
    expect(canPlace(s.board, shape, catR, catC, "p0")).toBe(false);
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: 0 })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: 1 })).toEqual({ score: 0 });
    expect(isTerminal({ ...s, winner: "draw" })).toEqual({ score: 50 });
  });

  it("placing a piece marks cells as p0", () => {
    const s = initialState(42, {});
    // Select first piece and place at (0,0)
    const s2 = reducer(s, { type: "selectPiece", idx: 0 });
    const s3 = reducer(s2, { type: "place", row: 0, col: 0 });
    const p0Cells = s3.board.filter((c) => c === "p0").length;
    expect(p0Cells).toBeGreaterThan(0);
  });
});
