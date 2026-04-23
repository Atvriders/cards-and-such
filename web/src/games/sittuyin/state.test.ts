import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, moveDests, initialBoard, applySittuyinMove, isInCheck } from "./state.js";
import type { SittuyinBoard, SittuyinPiece } from "./state.js";

const COLS = 8;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): SittuyinBoard { return new Array(64).fill(null); }
function p(color: SittuyinPiece["color"], type: SittuyinPiece["type"]): SittuyinPiece { return { color, type }; }

describe("Sittuyin", () => {
  it("initial board has correct kings", () => {
    const b = initialBoard();
    expect(b[idx(7,4)]).toEqual({ color: "white", type: "king" });
    expect(b[idx(0,4)]).toEqual({ color: "black", type: "king" });
    expect(b[idx(7,3)]).toEqual({ color: "white", type: "thida" });
  });

  it("thida moves only diagonally", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","thida");
    const dests = moveDests(b, 4, 4);
    expect(dests).toContain(idx(3,3));
    expect(dests).toContain(idx(3,5));
    expect(dests).toContain(idx(5,3));
    expect(dests).toContain(idx(5,5));
    expect(dests).not.toContain(idx(4,3));
    expect(dests).not.toContain(idx(3,4));
  });

  it("ein (elephant) leaps two diagonally", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","ein");
    const dests = moveDests(b, 4, 4);
    expect(dests).toContain(idx(2,2)); // two diagonal steps
    expect(dests).toContain(idx(2,6));
    expect(dests).toContain(idx(6,2));
    expect(dests).toContain(idx(6,6));
  });

  it("ne (pawn) promotes at row 0 for white", () => {
    const b = emptyBoard();
    b[idx(1,3)] = p("white","ne");
    b[idx(7,4)] = p("white","king");
    b[idx(0,4)] = p("black","king");
    const nb = applySittuyinMove(b, { from: idx(1,3), to: idx(0,3) }, false);
    expect(nb[idx(0,3)]?.type).toBe("pne");
  });

  it("isInCheck detects chariot attack", () => {
    const b = emptyBoard();
    b[idx(4,4)] = p("white","king");
    b[idx(4,0)] = p("black","yahhta");
    expect(isInCheck(b,"white")).toBe(true);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(0,{}))).toBeNull();
  });

  it("isTerminal returns 100 for white win", () => {
    const s = { ...initialState(0,{}), winner: "white" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("select stores legal targets for white king", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "select", sq: idx(7,4) });
    expect(next.selected).toBe(idx(7,4));
    // King may have limited moves, just check selected is set
    expect(next.legalTargets).toBeDefined();
  });
});
