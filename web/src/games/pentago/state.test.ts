import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, rotateQuadrant, checkFiveInRow } from "./state.js";
import type { PentagoState, Cell } from "./state.js";

describe("Pentago", () => {
  it("starts with empty board, Black to place first", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.phase).toBe("place");
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.board).toHaveLength(36);
  });

  it("placing a marble transitions to rotate phase", () => {
    const s = initialState(0, {});
    const s1 = reducer(s, { type: "place", pos: 0 });
    expect(s1.phase).toBe("rotate");
    expect(s1.board[0]).toBe(0);
    expect(s1.lastPlaced).toBe(0);
  });

  it("rotating a quadrant transitions back to place and bot moves", () => {
    const s = initialState(0, {});
    const s1 = reducer(s, { type: "place", pos: 0 });
    const s2 = reducer(s1, { type: "rotate", quadrant: 0, dir: "cw" });
    expect(s2.phase).toBe("place");
    expect(s2.turn).toBe(0); // back to human after bot moves
    // Bot should have placed a marble (exactly 2 stones on board)
    const stones = s2.board.filter((c) => c !== null).length;
    expect(stones).toBe(2);
  });

  it("rotateQuadrant CW works correctly for quadrant 0", () => {
    // Place markers at specific positions and verify rotation
    const board: Cell[] = new Array(36).fill(null);
    board[0] = 0; // top-left corner of q0 — after CW becomes top-right: pos 2
    const rotated = rotateQuadrant(board, 0, "cw");
    // After CW rotation of a 3×3:
    // (0,0) -> (0,2) in local coords -> global pos = 2
    expect(rotated[2]).toBe(0);
    expect(rotated[0]).toBeNull();
  });

  it("checkFiveInRow detects horizontal five", () => {
    const board: Cell[] = new Array(36).fill(null);
    for (let c = 0; c < 5; c++) board[c] = 0; // row 0, cols 0-4
    expect(checkFiveInRow(board)).toBe(0);
  });

  it("checkFiveInRow detects diagonal five", () => {
    const board: Cell[] = new Array(36).fill(null);
    for (let i = 0; i < 5; i++) board[i * 6 + i] = 1; // main diagonal
    expect(checkFiveInRow(board)).toBe(1);
  });

  it("isTerminal returns null mid-game and correct scores on win/loss/draw", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    const win: PentagoState = { ...s, winner: 0 };
    expect(isTerminal(win)).toEqual({ score: 100 });
    const loss: PentagoState = { ...s, winner: 1 };
    expect(isTerminal(loss)).toEqual({ score: 0 });
    const draw: PentagoState = { ...s, winner: "draw" };
    expect(isTerminal(draw)).toEqual({ score: 50 });
  });
});
