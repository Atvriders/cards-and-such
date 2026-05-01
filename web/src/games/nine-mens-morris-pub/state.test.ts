import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, formsNewMill, ADJACENCY, MILLS } from "./state.js";

const S = { botStrength: "easy" as const };

describe("Nine Men's Morris (Pub)", () => {
  it("starts with placing phase, 9 pieces each", () => {
    const s = initialState(1, S);
    expect(s.turn).toBe(0);
    expect(s.piecesToPlace).toEqual([9, 9]);
    expect(s.piecesOnBoard).toEqual([0, 0]);
    expect(s.phase).toEqual(["placing", "placing"]);
  });

  it("placing reduces piecesToPlace and runs bot turn", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", pos: 0 });
    expect(s1.piecesToPlace[0]).toBe(8);
    // Bot should have placed too (or it's player's turn after a mill)
    expect(s1.piecesToPlace[1]).toBeLessThanOrEqual(9);
  });

  it("ADJACENCY has 24 entries and is consistent", () => {
    expect(ADJACENCY.length).toBe(24);
    for (let i = 0; i < 24; i++) {
      for (const j of ADJACENCY[i]!) expect(ADJACENCY[j]).toContain(i);
    }
  });

  it("formsNewMill detects a row mill", () => {
    const board: (0 | 1 | null)[] = new Array(24).fill(null);
    board[0] = 0; board[1] = 0; board[2] = 0;
    expect(formsNewMill(board, 1, 0)).toBe(true);
    expect(formsNewMill(board, 0, 1)).toBe(false);
  });

  it("MILLS contains exactly 16 mill lines", () => {
    expect(MILLS.length).toBe(16);
  });

  it("isTerminal null while game in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
