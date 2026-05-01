import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, formsNewMill, ADJACENCY, MILLS, POINTS } from "./state.js";

const S = { botStrength: "easy" as const };

describe("Six Men's Morris", () => {
  it("starts placing with 6 pieces each, 16 intersections", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(POINTS);
    expect(s.piecesToPlace).toEqual([6, 6]);
    expect(s.phase).toEqual(["placing", "placing"]);
    expect(s.winner).toBeNull();
  });

  it("placing reduces toPlace count", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", pos: 0 });
    expect(s1.piecesToPlace[0]).toBe(5);
  });

  it("ADJACENCY is symmetric", () => {
    for (let i = 0; i < POINTS; i++) {
      for (const j of ADJACENCY[i]!) expect(ADJACENCY[j]).toContain(i);
    }
  });

  it("MILLS has exactly 8 lines (no diagonals)", () => {
    expect(MILLS.length).toBe(8);
  });

  it("formsNewMill detects an outer-square row mill", () => {
    const board: (0 | 1 | null)[] = new Array(POINTS).fill(null);
    board[0] = 0; board[1] = 0; board[2] = 0;
    expect(formsNewMill(board, 1, 0)).toBe(true);
  });

  it("isTerminal null while in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
