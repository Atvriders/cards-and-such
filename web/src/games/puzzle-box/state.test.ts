import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("PuzzleBox", () => {
  it("starts with 9 tiles and a blank (0) at one position", () => {
    const s = initialState(0, { shuffleMoves: "20", theme: "numbers" });
    expect(s.tiles).toHaveLength(9);
    expect(s.tiles.filter(t => t === 0)).toHaveLength(1);
    expect(s.movesMade).toBe(0);
    expect(s.won).toBe(false);
  });

  it("sliding a non-adjacent tile does nothing", () => {
    const s0 = initialState(42, { shuffleMoves: "20", theme: "numbers" });
    // Find the empty index, then find a non-adjacent tile
    const empty = s0.emptyIndex;
    const nonAdj = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(i => {
      if (i === empty) return false;
      const ar = Math.floor(empty / 3), ac = empty % 3;
      const br = Math.floor(i / 3), bc = i % 3;
      return !(ar === br && Math.abs(ac - bc) === 1) && !(ac === bc && Math.abs(ar - br) === 1);
    })!;
    const s1 = reducer(s0, { type: "slide", index: nonAdj });
    expect(s1.tiles).toEqual(s0.tiles);
    expect(s1.movesMade).toBe(0);
  });

  it("sliding an adjacent tile moves it and increments moves", () => {
    const s0 = initialState(1, { shuffleMoves: "20", theme: "numbers" });
    const empty = s0.emptyIndex;
    // Find an adjacent tile
    const adjIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8].find(i => {
      if (i === empty) return false;
      const ar = Math.floor(empty / 3), ac = empty % 3;
      const br = Math.floor(i / 3), bc = i % 3;
      return (ar === br && Math.abs(ac - bc) === 1) || (ac === bc && Math.abs(ar - br) === 1);
    })!;
    const movedTile = s0.tiles[adjIdx];
    const s1 = reducer(s0, { type: "slide", index: adjIdx });
    expect(s1.emptyIndex).toBe(adjIdx);
    expect(s1.tiles[empty]).toBe(movedTile);
    expect(s1.movesMade).toBe(1);
  });

  it("solved state triggers a win", () => {
    // Create a nearly-solved state manually
    const s0 = initialState(0, { shuffleMoves: "20", theme: "numbers" });
    // Force tiles to be solved except one swap
    const solved = { ...s0, tiles: [1, 2, 3, 4, 5, 6, 7, 0, 8], emptyIndex: 7 };
    const s1 = reducer(solved, { type: "slide", index: 8 });
    expect(s1.won).toBe(true);
  });

  it("isTerminal returns null while unsolved, score when won", () => {
    const s0 = initialState(0, { shuffleMoves: "20", theme: "numbers" });
    expect(isTerminal(s0)).toBeNull();
    const won = { ...s0, won: true, movesMade: 30 };
    const t = isTerminal(won);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(500);
  });

  it("restart creates a fresh shuffled board", () => {
    let s = initialState(5, { shuffleMoves: "50", theme: "emoji" });
    for (let i = 0; i < 10; i++) {
      const adj = [0,1,2,3,4,5,6,7,8].find(i2 => {
        if (i2 === s.emptyIndex) return false;
        const ar = Math.floor(s.emptyIndex/3), ac = s.emptyIndex%3;
        const br = Math.floor(i2/3), bc = i2%3;
        return (ar===br&&Math.abs(ac-bc)===1)||(ac===bc&&Math.abs(ar-br)===1);
      });
      if (adj !== undefined) s = reducer(s, { type: "slide", index: adj });
    }
    const reset = reducer(s, { type: "restart" });
    expect(reset.movesMade).toBe(0);
    expect(reset.won).toBe(false);
  });

  it("tiles array contains exactly 0-8 each once", () => {
    const s = initialState(100, { shuffleMoves: "100", theme: "colors" });
    const sorted = [...s.tiles].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
