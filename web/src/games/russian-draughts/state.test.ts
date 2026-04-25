import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";

describe("Russian Draughts", () => {
  it("starts with 12 pieces per side", () => {
    const s = initialState(0, {});
    let w=0, b=0;
    for(const row of s.board) for(const c of row) { if(c?.color==="W") w++; if(c?.color==="B") b++; }
    expect(w).toBe(12);
    expect(b).toBe(12);
    expect(s.turn).toBe("W");
  });

  it("dark squares only at start", () => {
    const s = initialState(0, {});
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      if((r+c)%2===0) expect(s.board[r]![c]).toBeNull();
    }
  });

  it("legal moves exist for white at start", () => {
    const s = initialState(0, {});
    const moves = getLegalMoves(s.board, "W", null);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every(m => m.captures.length===0)).toBe(true);
  });

  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal score > 0 for W win", () => {
    const s = { ...initialState(0, {}), winner: "W" as const };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("isTerminal 0 for B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("rejects click when not player's turn", () => {
    const s = { ...initialState(0, {}), turn: "B" as const };
    const next = reducer(s, { type: "click", row: 5, col: 0 });
    expect(next).toBe(s);
  });

  it("selecting a white piece updates selected", () => {
    const s = initialState(0, {});
    // Row 5, some col with W piece on dark square
    const wPiece = s.board.flatMap((row,r) => row.map((c,col) => c?.color==="W"?{r,col}:null)).find(x=>x);
    if (!wPiece) return;
    const next = reducer(s, { type: "click", row: wPiece.r, col: wPiece.col });
    expect(next.selected).toEqual([wPiece.r, wPiece.col]);
  });
});
