import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, tryAggressive, getPassiveMoves } from "./state.js";
import type { ShobuState } from "./state.js";
import type { Cell } from "./state.js";

describe("Shobu", () => {
  it("starts with 4 stones per board per player", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    for (let b = 0; b < 4; b++) {
      const human = s.boards[b]!.filter((c) => c === 0).length;
      const bot = s.boards[b]!.filter((c) => c === 1).length;
      expect(human).toBe(4);
      expect(bot).toBe(4);
    }
  });

  it("getPassiveMoves generates moves for human stones on home board", () => {
    const s = initialState(0);
    const moves = getPassiveMoves(s.boards[2]!, 2, 0);
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.every((m) => m.boardIdx === 2)).toBe(true);
  });

  it("tryAggressive pushing one opponent stone is valid", () => {
    const board: Cell[] = new Array(16).fill(null);
    board[8] = 0; // human at row 2 col 0
    board[4] = 1; // bot at row 1 col 0
    // Move up 1 step (dr=-1, dc=0, dist=1): human pushes bot
    const result = tryAggressive(board, 8, -1, 0, 1, 0);
    expect(result).not.toBeNull();
    expect(result![4]).toBe(0); // human moved here
  });

  it("tryAggressive pushing 2+ opponent stones is illegal", () => {
    const board: Cell[] = new Array(16).fill(null);
    board[8] = 0; // human row 2 col 0
    board[4] = 1; // bot row 1 col 0
    board[0] = 1; // bot row 0 col 0
    // Move up 2 steps: would push 2 bots
    const result = tryAggressive(board, 8, -1, 0, 2, 0);
    expect(result).toBeNull();
  });

  it("isTerminal returns null mid-game and score 100/0 on win/loss", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: ShobuState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: ShobuState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
