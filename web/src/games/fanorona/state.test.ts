import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, ADJACENCY, getCaptureType } from "./state.js";
import type { FanoronaState, Cell } from "./state.js";

const COLS = 9;
function pos(r: number, c: number): number { return r * COLS + c; }
function emptyBoard(): Cell[] { return new Array(45).fill(null); }

describe("Fanorona", () => {
  it("initial state: correct piece counts, white to move", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0); // white (player) goes first
    expect(s.winner).toBeNull();
    expect(s.board.filter(c => c === 0).length).toBe(22);
    expect(s.board.filter(c => c === 1).length).toBe(22);
    expect(s.board[pos(2, 4)]).toBeNull(); // center of middle row empty
  });

  it("adjacency includes diagonal at even-sum cells only", () => {
    // (0,0) has sum 0 (even) — should have diagonal neighbor (1,1)
    expect(ADJACENCY[pos(0,0)]!.includes(pos(1,1))).toBe(true);
    // (0,1) has sum 1 (odd) — should NOT have diagonal neighbor
    expect(ADJACENCY[pos(0,1)]!.includes(pos(1,2))).toBe(false);
    expect(ADJACENCY[pos(0,1)]!.includes(pos(1,0))).toBe(false);
  });

  it("getCaptureType: approach captures forward pieces", () => {
    const board = emptyBoard();
    board[pos(2,2)] = 0; // white at 2,2
    board[pos(2,3)] = 1; // black at 2,3 — approach would capture by moving from 2,1 to 2,2...
    // Actually: white moves from 2,2 to 2,3? No — 2,3 is occupied.
    // Test: white at 2,1, black at 2,2, empty at 2,3
    const b2 = emptyBoard();
    b2[pos(2,1)] = 0;
    b2[pos(2,2)] = 1;
    const ct = getCaptureType(b2, pos(2,1), pos(2,2), 0);
    // can't move to occupied — this would not be a valid move target
    // Let's test properly: white at 2,0, black at 2,1, moving toward 2,1... occupied again
    // approach: white moves toward opponent
    const b3 = emptyBoard();
    b3[pos(2,0)] = 0; // white
    b3[pos(2,1)] = 1; // black
    // Moving white from 2,0 to 2,1 — but 2,1 is occupied, so not a legal target
    // The function getCaptureType is called when we're moving TO an empty cell
    // that has opponent pieces in the approach direction BEYOND it
    const b4 = emptyBoard();
    b4[pos(2,0)] = 0;
    b4[pos(2,2)] = 1; // black 2 steps ahead
    // Moving white 2,0 -> 2,1 (empty). Approach: next in direction (2,2) is black -> approach capture
    expect(getCaptureType(b4, pos(2,0), pos(2,1), 0)).toBe("approach");
  });

  it("select rejected for wrong piece", () => {
    const s = initialState(0, {});
    const atkPos = s.board.findIndex(c => c === 1);
    const next = reducer(s, { type: "select", pos: atkPos });
    expect(next.selected).toBeNull();
  });

  it("isTerminal returns win when white captures all black", () => {
    const board = emptyBoard();
    board[pos(0,0)] = 0; // only white pieces
    board[pos(0,1)] = 0;
    const s: FanoronaState = {
      board, turn: 0, selected: null, chainFrom: null, usedDirections: [],
      winner: 0, rngSeed: 0, settings: {},
    };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal returns loss when black wins", () => {
    const board = emptyBoard();
    board[pos(0,0)] = 1;
    const s: FanoronaState = {
      board, turn: 1, selected: null, chainFrom: null, usedDirections: [],
      winner: 1, rngSeed: 0, settings: {},
    };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });
});
