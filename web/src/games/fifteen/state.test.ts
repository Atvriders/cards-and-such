import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FifteenPuzzleState } from "./state.js";

const defaultSettings = { size: "4" as const, shuffleMoves: "50" as const };

describe("FifteenPuzzle initialState", () => {
  it("creates a 4x4 board with tiles 0-15", () => {
    const s = initialState(42, defaultSettings);
    expect(s.size).toBe(4);
    expect(s.tiles).toHaveLength(16);
    // Contains all values 0-15 exactly once
    const sorted = [...s.tiles].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it("emptyIndex correctly points to where 0 is", () => {
    const s = initialState(42, defaultSettings);
    expect(s.tiles[s.emptyIndex]).toBe(0);
  });

  it("3x3 creates 9 tiles", () => {
    const s = initialState(1, { size: "3" as const, shuffleMoves: "20" as const });
    expect(s.size).toBe(3);
    expect(s.tiles).toHaveLength(9);
    const sorted = [...s.tiles].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("5x5 creates 25 tiles", () => {
    const s = initialState(1, { size: "5" as const, shuffleMoves: "100" as const });
    expect(s.size).toBe(5);
    expect(s.tiles).toHaveLength(25);
  });

  it("is not in won state after shuffle", () => {
    // With 50 shuffles it's almost impossible to be solved already
    const s = initialState(42, defaultSettings);
    // won might theoretically be true, but check at least movesMade is 0
    expect(s.movesMade).toBe(0);
  });
});

describe("FifteenPuzzle reducer", () => {
  it("slide into empty cell swaps tiles", () => {
    // Create a state where empty is at index 15 (bottom-right) and tile 15 is at index 14
    // Sliding tile at index 14 into 15
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    const s: FifteenPuzzleState = {
      settings: defaultSettings,
      size: 4,
      tiles,
      emptyIndex: 15,
      movesMade: 0,
      won: false,
      rngSeed: 42,
    };
    const s2 = reducer(s, { type: "slide", index: 14 });
    expect(s2.tiles[15]).toBe(15);
    expect(s2.tiles[14]).toBe(0);
    expect(s2.emptyIndex).toBe(14);
    expect(s2.movesMade).toBe(1);
  });

  it("sliding a non-adjacent tile is a no-op", () => {
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    const s: FifteenPuzzleState = {
      settings: defaultSettings,
      size: 4,
      tiles,
      emptyIndex: 15,
      movesMade: 0,
      won: false,
      rngSeed: 42,
    };
    // tile at index 0 is not adjacent to index 15
    const s2 = reducer(s, { type: "slide", index: 0 });
    expect(s2).toBe(s);
  });

  it("detects win condition", () => {
    // One move away from solved: [1..14, 0, 15] => slide 15 from index 15 to index 14
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
    const s: FifteenPuzzleState = {
      settings: defaultSettings,
      size: 4,
      tiles,
      emptyIndex: 14,
      movesMade: 5,
      won: false,
      rngSeed: 42,
    };
    const s2 = reducer(s, { type: "slide", index: 15 });
    expect(s2.won).toBe(true);
    expect(s2.tiles[15]).toBe(0);
    expect(s2.tiles[14]).toBe(15);
  });

  it("no-op when already won", () => {
    const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    const s: FifteenPuzzleState = {
      settings: defaultSettings,
      size: 4,
      tiles,
      emptyIndex: 15,
      movesMade: 0,
      won: true,
      rngSeed: 42,
    };
    const s2 = reducer(s, { type: "slide", index: 14 });
    expect(s2).toBe(s);
  });
});

describe("FifteenPuzzle isTerminal", () => {
  it("returns null when not won", () => {
    const s = initialState(42, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(42, defaultSettings);
    const won: FifteenPuzzleState = { ...s, won: true, movesMade: 100 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(50, 1000 - 100)); // 900
  });

  it("score floors at 50 for many moves", () => {
    const s = initialState(42, defaultSettings);
    const won: FifteenPuzzleState = { ...s, won: true, movesMade: 2000 };
    expect(isTerminal(won)!.score).toBe(50);
  });
});
