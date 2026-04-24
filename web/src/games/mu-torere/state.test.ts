import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, allMovesFor } from "./state.js";
import type { MuTorereState } from "./state.js";

describe("Mu Torere", () => {
  it("starts with correct piece placement", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    // Human on 0-3, bot on 4-7, center empty
    for (let i = 0; i < 4; i++) expect(s.spaces[i]).toBe(0);
    for (let i = 4; i < 8; i++) expect(s.spaces[i]).toBe(1);
    expect(s.spaces[8]).toBeNull();
  });

  it("human piece at index 3 can move to adjacent (index 2 or 4) if empty, and to center if adjacent to opponent", () => {
    const s = initialState(0);
    // Position 3 is adjacent to 2 (human) and 4 (bot)
    // So center move requires adjacent to opponent (pos 4 = bot) → yes
    // But pos 2 is occupied by human, and pos 4 is bot (not empty)
    // Only center should be reachable since center is empty and pos 4 is opponent
    const legal = getLegalMoves(s.spaces, 3, 0);
    expect(legal).toContain(8); // center
    // pos 2 is occupied (human), pos 4 is not empty → no kewai moves
    expect(legal).not.toContain(2);
    expect(legal).not.toContain(4);
  });

  it("selecting own piece sets selected", () => {
    const s = initialState(0);
    const s1 = reducer(s, { type: "select", idx: 0 });
    expect(s1.selected).toBe(0);
  });

  it("allMovesFor generates moves for center piece", () => {
    const spaces = new Array(9).fill(null) as Array<0 | 1 | null>;
    spaces[8] = 0; // human at center
    spaces[4] = 1;
    spaces[5] = 1;
    const moves = allMovesFor(spaces, 0);
    // Can move to any empty kewai
    const targets = moves.map((m) => m.to);
    expect(targets).toContain(0);
    expect(targets).toContain(1);
    expect(targets).toContain(2);
    expect(targets).not.toContain(4); // bot there
  });

  it("isTerminal returns null mid-game and correct scores on terminal", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: MuTorereState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: MuTorereState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
