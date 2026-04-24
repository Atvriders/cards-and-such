import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, countLOS, hexKey, onBoard } from "./state.js";
import type { TumbleweedState } from "./state.js";

describe("Tumbleweed", () => {
  it("starts with 2 pieces (one per player) on board", () => {
    const s = initialState(0);
    let human = 0, bot = 0;
    for (const cell of s.board.values()) {
      if (cell.owner === 0) human++;
      else if (cell.owner === 1) bot++;
    }
    expect(human).toBe(1);
    expect(bot).toBe(1);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
  });

  it("onBoard is correct for radius 3 hex grid", () => {
    expect(onBoard(0, 0)).toBe(true);
    expect(onBoard(3, 0)).toBe(true);
    expect(onBoard(0, 3)).toBe(true);
    expect(onBoard(4, 0)).toBe(false);
    expect(onBoard(2, 2)).toBe(false); // |q+r|=4 > 3
  });

  it("countLOS counts own pieces visible from a hex", () => {
    const s = initialState(0);
    // Human piece at (0, 3): look from adjacent hex
    const los = countLOS(s.board, 0, 2, 0); // one step away from human piece
    expect(los).toBe(1); // can see the piece at (0,3)
  });

  it("getLegalMoves returns valid placements with LOS > 0", () => {
    const s = initialState(0);
    const moves = getLegalMoves(s.board, 0);
    expect(moves.length).toBeGreaterThan(0);
    // All returned hexes should be empty or opponent
    for (const m of moves) {
      const cell = s.board.get(hexKey(m.q, m.r));
      expect(cell?.owner === 0).toBe(false); // not own piece
    }
  });

  it("isTerminal returns null mid-game and correct scores on win/loss", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: TumbleweedState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: TumbleweedState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
