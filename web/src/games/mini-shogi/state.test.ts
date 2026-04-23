import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, moveDests, initialBoard, applyMove, isInCheck } from "./state.js";
import type { MiniBoard, MiniPiece, MiniHand } from "./state.js";

const COLS = 5;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): MiniBoard { return new Array(25).fill(null); }
function p(color: MiniPiece["color"], type: MiniPiece["type"]): MiniPiece { return { color, type, promoted: false }; }

describe("Mini Shogi", () => {
  it("initial board has 12 pieces", () => {
    const b = initialBoard();
    const pieces = b.filter(Boolean);
    expect(pieces.length).toBe(12); // 6 per side
    expect(b[idx(4,0)]).toEqual({ color: "sente", type: "king", promoted: false });
    expect(b[idx(0,4)]).toEqual({ color: "gote", type: "king", promoted: false });
  });

  it("pawn moves forward only", () => {
    const b = emptyBoard();
    b[idx(3,2)] = p("sente","pawn");
    const dests = moveDests(b, 3, 2);
    expect(dests).toContain(idx(2,2));
    expect(dests).not.toContain(idx(4,2));
    expect(dests.length).toBe(1);
  });

  it("rook slides and is blocked", () => {
    const b = emptyBoard();
    b[idx(2,2)] = p("sente","rook");
    b[idx(2,4)] = p("gote","pawn"); // can capture
    const dests = moveDests(b, 2, 2);
    expect(dests).toContain(idx(2,4)); // capture
    expect(dests).toContain(idx(2,0)); // slide left
  });

  it("promotion happens when entering promotion zone", () => {
    const b = emptyBoard();
    b[idx(1,2)] = p("sente","pawn");
    const hand: MiniHand = {};
    const mv = { from: idx(1,2), to: idx(0,2), promote: true };
    const { board: nb } = applyMove(b, hand, mv, "sente");
    expect(nb[idx(0,2)]?.type).toBe("ppawn");
    expect(nb[idx(0,2)]?.promoted).toBe(true);
  });

  it("isInCheck detects rook attack", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("sente","king");
    b[idx(0,4)] = p("gote","rook");
    expect(isInCheck(b, "sente")).toBe(true);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for sente win", () => {
    const s = { ...initialState(0,{}), winner: "sente" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("select places legal targets", () => {
    const s = initialState(0,{});
    const next = reducer(s, { type: "select", sq: idx(4,0) }); // king
    expect(next.selected).toBe(idx(4,0));
    expect(next.legalTargets.length).toBeGreaterThan(0);
  });
});
