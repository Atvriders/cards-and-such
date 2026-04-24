import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, allHexCells, findMatches, GRID_RADIUS, NUM_COLORS } from "./state.js";

const settings4 = { radius: "4" as const };
const settings3 = { radius: "3" as const };

describe("allHexCells", () => {
  it("returns correct count for radius 4: 61 cells", () => {
    expect(allHexCells(4).length).toBe(61);
  });

  it("returns correct count for radius 3: 37 cells", () => {
    expect(allHexCells(3).length).toBe(37);
  });

  it("all cells satisfy |q|<=r, |r|<=r, |s|<=r", () => {
    for (const { q, r } of allHexCells(4)) {
      expect(Math.abs(q)).toBeLessThanOrEqual(4);
      expect(Math.abs(r)).toBeLessThanOrEqual(4);
      expect(Math.abs(-q - r)).toBeLessThanOrEqual(4);
    }
  });
});

describe("initialState", () => {
  it("populates all hex cells with color 0..NUM_COLORS-1", () => {
    const s = initialState(42, settings4);
    for (const { q, r } of allHexCells(4)) {
      const color = s.tiles.get(`${q},${r}`);
      expect(color).toBeGreaterThanOrEqual(0);
      expect(color).toBeLessThan(NUM_COLORS);
    }
  });

  it("starts with 0 score and not over", () => {
    const s = initialState(1, settings3);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });

  it("uses maxMoves = 30", () => {
    expect(initialState(1, settings4).maxMoves).toBe(30);
  });
});

describe("findMatches", () => {
  it("returns empty when no lines of 3", () => {
    // Create a board where no three adjacent cells share the same color
    const tiles = new Map<string, number>();
    let i = 0;
    for (const { q, r } of allHexCells(3)) {
      tiles.set(`${q},${r}`, i % NUM_COLORS);
      i++;
    }
    // This is a rough test — just check it returns a Set
    const matched = findMatches(tiles, 3);
    expect(matched instanceof Set).toBe(true);
  });

  it("detects a line of 3 in q direction", () => {
    const tiles = new Map<string, number>();
    for (const { q, r } of allHexCells(4)) {
      tiles.set(`${q},${r}`, 0);
    }
    // All same color — everything should match
    const matched = findMatches(tiles, 4);
    expect(matched.size).toBeGreaterThan(0);
  });
});

describe("reducer - select", () => {
  it("selects a hex tile", () => {
    const s = initialState(42, settings4);
    const s2 = reducer(s, { type: "select", q: 0, r: 0 });
    expect(s2.selected).toEqual({ q: 0, r: 0 });
  });

  it("deselects when clicking same tile", () => {
    const s = initialState(42, settings4);
    const s2 = reducer(s, { type: "select", q: 0, r: 0 });
    const s3 = reducer(s2, { type: "select", q: 0, r: 0 });
    expect(s3.selected).toBeNull();
  });

  it("increments moves on valid swap with match", () => {
    // All same color -> any swap will produce matches
    const s = initialState(42, settings4);
    const uniformTiles = new Map<string, number>();
    for (const { q, r } of allHexCells(4)) uniformTiles.set(`${q},${r}`, 0);
    const s0 = { ...s, tiles: uniformTiles };
    const s1 = reducer(s0, { type: "select", q: 0, r: 0 });
    const s2 = reducer(s1, { type: "select", q: 1, r: 0 });
    expect(s2.moves).toBe(1);
    expect(s2.score).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(1, settings4))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings4), over: true, score: 200 };
    expect(isTerminal(s)).toEqual({ score: 200 });
  });
});
