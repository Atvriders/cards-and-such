import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";

describe("Pool Checkers", () => {
  it("starts with 12 pieces per side", () => {
    const s = initialState(0, {});
    let w=0, b=0;
    for(const row of s.board) for(const c of row) { if(c?.color==="W") w++; if(c?.color==="B") b++; }
    expect(w).toBe(12);
    expect(b).toBe(12);
    expect(s.turn).toBe("W");
  });

  it("pieces on dark squares only", () => {
    const s = initialState(0, {});
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      if((r+c)%2===0) expect(s.board[r]![c]).toBeNull();
    }
  });

  it("legal moves at start", () => {
    const s = initialState(0, {});
    const moves = getLegalMoves(s.board, "W", null);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("isTerminal null mid-game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("isTerminal positive score for W win", () => {
    const s = { ...initialState(0, {}), winner: "W" as const };
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("isTerminal 0 for B win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("rejects action when not player turn", () => {
    const s = { ...initialState(0, {}), turn: "B" as const };
    expect(reducer(s, { type: "click", row: 5, col: 0 })).toBe(s);
  });

  it("click on W piece sets selected", () => {
    const s = initialState(0, {});
    const wPiece = s.board.flatMap((row,r) => row.map((c,col)=>c?.color==="W"?{r,col}:null)).find(x=>x);
    if (!wPiece) return;
    const next = reducer(s, { type: "click", row: wPiece.r, col: wPiece.col });
    expect(next.selected).toEqual([wPiece.r, wPiece.col]);
  });
});
