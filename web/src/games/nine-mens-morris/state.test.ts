import { describe, expect, it } from "vitest";
import {
  initialState,
  reducer,
  isTerminal,
  formsNewMill,
  canRemove,
  MILLS,
  type MorrisState,
  type Cell,
} from "./state.js";

function makeState(overrides: Partial<MorrisState> = {}): MorrisState {
  return { ...initialState(0, {}), ...overrides };
}

describe("Nine Men's Morris", () => {
  it("starts with 9 pieces to place for each player and no pieces on board", () => {
    const s = initialState(42, {});
    expect(s.piecesToPlace).toEqual([9, 9]);
    expect(s.piecesOnBoard).toEqual([0, 0]);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(s.turn).toBe(0);
    expect(s.phase).toEqual(["placing", "placing"]);
  });

  it("player can place piece on empty intersection", () => {
    const s = makeState();
    const next = reducer(s, { type: "place", pos: 0 });
    expect(next.board[0]).toBe(0);
    expect(next.piecesOnBoard[0]).toBe(1);
    expect(next.piecesToPlace[0]).toBe(8);
  });

  it("cannot place on occupied intersection", () => {
    const s = makeState();
    const s1 = reducer(s, { type: "place", pos: 0 });
    // bot moved after player, so find an empty spot
    // Player tries to place on pos 0 (which is player's piece)
    const board = [...s1.board];
    board[5] = 0; // manually set to player to test
    const s2: MorrisState = { ...s1, board, turn: 0, piecesToPlace: [7, 8] };
    const s3 = reducer(s2, { type: "place", pos: 5 }); // occupied by player
    expect(s3).toBe(s2);
  });

  it("formsNewMill detects a mill correctly", () => {
    const board: Cell[] = new Array(24).fill(null) as Cell[];
    board[0] = 0;
    board[1] = 0;
    board[2] = 0;
    expect(formsNewMill(board, 2, 0)).toBe(true);
    expect(formsNewMill(board, 2, 1)).toBe(false);
  });

  it("canRemove allows removal of non-mill piece", () => {
    const board: Cell[] = new Array(24).fill(null) as Cell[];
    board[4] = 1; // isolated bot piece
    expect(canRemove(board, 4, 1)).toBe(true);
  });

  it("canRemove prevents removal of piece in mill if free pieces exist", () => {
    const board: Cell[] = new Array(24).fill(null) as Cell[];
    // Set up mill for bot at positions 0,1,2
    board[0] = 1;
    board[1] = 1;
    board[2] = 1;
    // Bot also has a free piece
    board[4] = 1;
    expect(canRemove(board, 0, 1)).toBe(false); // pos 0 is in mill
    expect(canRemove(board, 4, 1)).toBe(true);  // pos 4 is free
  });

  it("isTerminal returns null during play and score on win", () => {
    const s = makeState();
    expect(isTerminal(s)).toBeNull();
    const winning = makeState({ winner: 0 });
    expect(isTerminal(winning)).toEqual({ score: 100 });
    const losing = makeState({ winner: 1 });
    expect(isTerminal(losing)).toEqual({ score: 0 });
  });

  it("all mills have exactly 3 positions and all positions are 0-23", () => {
    for (const mill of MILLS) {
      expect(mill).toHaveLength(3);
      for (const pos of mill) {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(24);
      }
    }
  });
});
