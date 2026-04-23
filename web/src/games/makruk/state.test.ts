import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, moveDests, initialBoard, applyMakrukMove, isInCheck } from "./state.js";
import type { MakrukBoard, MakrukPiece } from "./state.js";

const COLS = 8;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): MakrukBoard { return new Array(64).fill(null); }
function p(color: MakrukPiece["color"], type: MakrukPiece["type"]): MakrukPiece { return { color, type }; }

describe("Makruk", () => {
  it("initial board has correct structure", () => {
    const b = initialBoard();
    expect(b[idx(7,4)]).toEqual({ color: "white", type: "king" });
    expect(b[idx(0,4)]).toEqual({ color: "black", type: "king" });
    // White pawns at row 6
    for (let c = 0; c < 8; c++) expect(b[idx(6,c)]?.type).toBe("bia");
  });

  it("bia (pawn) moves forward and captures diagonally", () => {
    const b = emptyBoard();
    b[idx(5,3)] = p("white","bia");
    b[idx(4,2)] = p("black","bia");
    const dests = moveDests(b, 5, 3);
    expect(dests).toContain(idx(4,3)); // forward
    expect(dests).toContain(idx(4,2)); // diagonal capture
    expect(dests).not.toContain(idx(4,4)); // no piece to capture
  });

  it("bia promotes when reaching rank 2 (row index 2)", () => {
    const b = emptyBoard();
    b[idx(3,3)] = p("white","bia");
    b[idx(7,4)] = p("white","king");
    b[idx(0,4)] = p("black","king");
    const nb = applyMakrukMove(b, { from: idx(3,3), to: idx(2,3) });
    expect(nb[idx(2,3)]?.type).toBe("pbia");
  });

  it("met moves one step diagonally or forward", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","met");
    const dests = moveDests(b, 4, 4);
    expect(dests).toContain(idx(3,3)); // diagonal
    expect(dests).toContain(idx(3,5)); // diagonal
    expect(dests).toContain(idx(3,4)); // forward (white goes up)
    expect(dests).not.toContain(idx(4,3)); // no sideways
  });

  it("ruea slides orthogonally", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","ruea");
    const dests = moveDests(b, 4, 4);
    expect(dests).toContain(idx(0,4));
    expect(dests).toContain(idx(7,4));
    expect(dests).toContain(idx(4,0));
    expect(dests).toContain(idx(4,7));
  });

  it("isInCheck detects rook attack", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","king");
    b[idx(4,0)] = p("black","ruea");
    expect(isInCheck(b,"white")).toBe(true);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for white win", () => {
    const s = { ...initialState(0,{}), winner: "white" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});
