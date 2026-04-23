import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, moveDests, initialBoard, applyMove, isInCheck } from "./state.js";
import type { ShogiBoard, ShogiPiece, Hand } from "./state.js";

const COLS = 9;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): ShogiBoard { return new Array(81).fill(null); }
function p(color: ShogiPiece["color"], type: ShogiPiece["type"]): ShogiPiece { return { color, type, promoted: false }; }

describe("Shogi", () => {
  it("initial board has kings and pawns", () => {
    const b = initialBoard();
    expect(b[idx(8,4)]).toEqual({ color: "sente", type: "king", promoted: false });
    expect(b[idx(0,4)]).toEqual({ color: "gote", type: "king", promoted: false });
    // Sente pawns on row 6
    for (let c = 0; c < 9; c++) expect(b[idx(6,c)]?.type).toBe("pawn");
    // Gote pawns on row 2
    for (let c = 0; c < 9; c++) expect(b[idx(2,c)]?.type).toBe("pawn");
  });

  it("pawn moves one forward", () => {
    const b = emptyBoard();
    b[idx(5,4)] = p("sente","pawn");
    const dests = moveDests(b, 5, 4);
    expect(dests).toContain(idx(4,4)); // forward for sente = row -1
    expect(dests).not.toContain(idx(6,4));
  });

  it("rook slides orthogonally", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("sente","rook");
    const dests = moveDests(b, 4, 4);
    // Should reach edge of board in all 4 directions
    expect(dests).toContain(idx(0,4));
    expect(dests).toContain(idx(8,4));
    expect(dests).toContain(idx(4,0));
    expect(dests).toContain(idx(4,8));
  });

  it("captured piece goes to hand", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("sente","rook");
    b[idx(2,4)] = p("gote","pawn");
    const hand: Hand = {};
    const mv = { from: idx(4,4), to: idx(2,4), promote: false };
    const { hand: nh } = applyMove(b, hand, mv, "sente");
    expect(nh.pawn).toBe(1);
  });

  it("isInCheck detects king in danger", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("sente","king");
    b[idx(4,0)] = p("gote","rook");
    expect(isInCheck(b, "sente")).toBe(true);
  });

  it("isInCheck returns false when safe", () => {
    const b = initialBoard();
    expect(isInCheck(b, "sente")).toBe(false);
    expect(isInCheck(b, "gote")).toBe(false);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal returns score when winner set", () => {
    const s = { ...initialState(0, {}), winner: "sente" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
    const s2 = { ...s, winner: "gote" as const };
    expect(isTerminal(s2)).toEqual({ score: 0 });
  });
});
