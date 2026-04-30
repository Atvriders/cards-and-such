import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isSolved, neighborsOf, SOLVED, SIZE } from "./state.js";

const S = { dummy: false };

describe("eight-puzzle", () => {
  it("starts in playing phase with 9 tiles including blank", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.tiles.length).toBe(SIZE * SIZE);
    expect(s.tiles).toContain(0);
  });
  it("starts unsolved with high probability", () => {
    expect(isSolved(initialState(7, S).tiles)).toBe(false);
  });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("sliding adjacent tile increments moves and swaps with blank", () => {
    const s = initialState(1, S);
    const blank = s.tiles.indexOf(0);
    const target = neighborsOf(blank)[0]!;
    const moved = s.tiles[target];
    const s2 = reducer(s, { type: "slide", index: target });
    expect(s2.moves).toBe(1);
    expect(s2.tiles[blank]).toBe(moved);
    expect(s2.tiles[target]).toBe(0);
  });
  it("sliding non-adjacent tile is rejected", () => {
    const s = initialState(1, S);
    const blank = s.tiles.indexOf(0);
    let far = -1;
    for (let i = 0; i < 9; i++) if (!neighborsOf(blank).includes(i) && i !== blank) { far = i; break; }
    if (far >= 0) {
      const s2 = reducer(s, { type: "slide", index: far });
      expect(s2.moves).toBe(0);
      expect(s2.tiles).toEqual(s.tiles);
    }
  });
  it("solved board with one swap completes on slide", () => {
    const tiles = [...SOLVED];
    [tiles[8], tiles[7]] = [tiles[7]!, tiles[8]!];
    const s: ReturnType<typeof initialState> = { rngSeed: 1, tiles, moves: 0, phase: "playing" };
    const s2 = reducer(s, { type: "slide", index: 8 });
    expect(s2.phase).toBe("done");
    expect(isTerminal(s2)).not.toBeNull();
  });
  it("reset reshuffles and resets moves", () => {
    let s = initialState(1, S);
    const blank = s.tiles.indexOf(0);
    s = reducer(s, { type: "slide", index: neighborsOf(blank)[0]! });
    s = reducer(s, { type: "reset" });
    expect(s.moves).toBe(0);
    expect(s.phase).toBe("playing");
  });
});
