import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getFloodedRegion, SIZE } from "./state.js";

const settings4 = { colors: "4" as const };
const settings5 = { colors: "5" as const };

describe("initialState", () => {
  it("creates a SIZE×SIZE grid", () => {
    const s = initialState(42, settings4);
    expect(s.grid.length).toBe(SIZE);
    expect(s.grid[0]!.length).toBe(SIZE);
  });

  it("starts with 0 moves and not over", () => {
    const s = initialState(1, settings5);
    expect(s.moves).toBe(0);
    expect(s.over).toBe(false);
    expect(s.won).toBe(false);
  });

  it("numColors matches settings", () => {
    const s = initialState(7, { colors: "6" as const });
    expect(s.numColors).toBe(6);
    const allColors = s.grid.flat();
    expect(allColors.every((c) => c >= 0 && c < 6)).toBe(true);
  });
});

describe("getFloodedRegion", () => {
  it("includes the top-left cell", () => {
    const s = initialState(42, settings4);
    const region = getFloodedRegion(s.grid);
    expect(region.has("0,0")).toBe(true);
  });

  it("returns at least 1 cell", () => {
    const s = initialState(99, settings5);
    expect(getFloodedRegion(s.grid).size).toBeGreaterThanOrEqual(1);
  });
});

describe("reducer - flood", () => {
  it("no-op when clicking current color", () => {
    const s = initialState(42, settings4);
    const currentColor = s.grid[0]![0]!;
    const s2 = reducer(s, { type: "flood", color: currentColor });
    expect(s2.moves).toBe(0);
  });

  it("increments move count on valid flood", () => {
    const s = initialState(42, settings4);
    const currentColor = s.grid[0]![0]!;
    const otherColor = (currentColor + 1) % s.numColors;
    const s2 = reducer(s, { type: "flood", color: otherColor });
    expect(s2.moves).toBe(1);
  });

  it("game ends when maxMoves reached", () => {
    let s = initialState(42, settings4);
    const colorA = (s.grid[0]![0]! + 1) % s.numColors;
    const colorB = (s.grid[0]![0]! + 2) % s.numColors;
    // Force over by exhausting moves
    for (let i = 0; i < s.maxMoves; i++) {
      const cur = s.grid[0]![0]!;
      const next = (cur + 1) % s.numColors;
      s = reducer(s, { type: "flood", color: next });
      if (s.over) break;
    }
    expect(s.over).toBe(true);
    void colorA; void colorB;
  });

  it("does not mutate after game over", () => {
    const s = { ...initialState(1, settings4), over: true, won: false };
    const s2 = reducer(s, { type: "flood", color: 0 });
    expect(s2).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while ongoing", () => {
    expect(isTerminal(initialState(42, settings4))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, settings4), over: true, won: true, moves: 10, maxMoves: 22 };
    const t = isTerminal(s);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });

  it("returns 0 score when lost", () => {
    const s = { ...initialState(1, settings4), over: true, won: false };
    expect(isTerminal(s)!.score).toBe(0);
  });
});
